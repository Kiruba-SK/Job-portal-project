from django.shortcuts import render
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework import status, generics, serializers, viewsets
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
import logging
from rest_framework.parsers import JSONParser
import cloudinary.uploader

from apiApp.models import Company, Job, Application, UserResume
from apiApp.serializers import CompanySerializer, JobSerializer, ApplicationSerializer, ResumeUploadSerializer
from django.contrib.auth.hashers import make_password,check_password

logger = logging.getLogger(__name__)


# Create your views here.

# --------JOB views---------

class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    
    def get_queryset(self):
        company_id = self.request.query_params.get('company_id')
        if company_id:
            return Job.objects.filter(company__pk=company_id)  
        return Job.objects.all()

# --------APPLICATION POST-----------

class ApplyToJobView(APIView):

    def post(self, request):
        email = request.data.get('user_email')
        name = request.data.get('user_name')
        image = request.data.get('user_img')
        job_id = request.data.get('job_id') 
        resume_url = request.data.get('resume')

        if not email or not job_id:
            return Response({"error": "Missing email or job_id"}, status=400)

        try:
            job = Job.objects.get(_id=job_id)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        # Check if already applied
        if Application.objects.filter(user_email=email, job=job).exists():
            return Response({"message": "Already applied"}, status=200)

        # If no resume provided, try latest
        if not resume_url:
            try:
                user_resume = UserResume.objects.get(email=email)
                resume_url = user_resume.resume
            except UserResume.DoesNotExist:
                return Response({"error": "No resume uploaded yet"}, status=400)

        application = Application.objects.create(
            user_email=email,
            user_name=name,
            user_img=image,
            job=job,
            resume=resume_url
        )

        serializer = ApplicationSerializer(application, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)



# --------APPLICATIONS GET-----------

class ApplicationListAPIView(ListAPIView):
    queryset = Application.objects.all().select_related('job')
    serializer_class = ApplicationSerializer


class UserApplicationsAPIView(generics.ListAPIView):
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        email = self.request.query_params.get('email')
        return Application.objects.filter(user_email=email).select_related('job__company')

    def get_serializer_context(self):
        return {'request': self.request}


class CompanyApplicationsList(generics.ListAPIView):
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        company_email = self.request.query_params.get('email')
        if company_email:
            # Get jobs for the company
            company = Company.objects.filter(email=company_email).first()
            if company:
                jobs = Job.objects.filter(company=company)
                applications = Application.objects.filter(job__in=jobs)
                return applications
        return Application.objects.none()

    def get_serializer_context(self):
        return {'request': self.request}


class UpdateApplicationStatusAPIView(APIView):
    parser_classes = [JSONParser]

    def patch(self, request, *args, **kwargs):
        application_id = request.data.get('application_id')
        new_status = request.data.get('status')

        if not application_id or not new_status:
            return Response({'error': 'application_id and status are required'}, status=400)

        if new_status not in ['Accepted', 'Rejected', 'Pending']:
            return Response({'error': 'Invalid status value'}, status=400)

        try:
            application = Application.objects.get(id=application_id)
        except Application.DoesNotExist:
            return Response({'error': 'Application not found'}, status=404)

        application.status = new_status
        application.save()

        return Response({'message': 'Application status updated', 'new_status': application.status}, status=200)
    

# -------- RESUME UPLOAD --------

class UploadResumeAPIView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        try:
            email = request.data.get('email')
            resume_file = request.FILES.get('resume') 

            if not email:
                return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

            if not resume_file:
                return Response({'error': 'No resume file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)
            
            upload_result = cloudinary.uploader.upload(
                resume_file,
                upload_preset="unsigned_resume", 
                resource_type="raw",
                folder="resumes/",
                public_id=f"{email.replace('@', '_at_')}_resume",
                overwrite=True
            )

            resume_url = upload_result.get("secure_url")
            if not resume_url:
                return Response({'error': 'Failed to upload resume to Cloudinary.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            UserResume.objects.update_or_create(
                email=email,
                defaults={'resume': resume_url}
            )

            return Response({
                'message': 'Resume uploaded successfully',
                'resume': resume_url
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print("Upload failed:", e)
            logger.error(f"Upload error: {e}", exc_info=True)
            return Response({'error': 'Upload failed.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserResumeRetrieveAPIView(APIView):
    def get(self, request):
        email = request.query_params.get('email')
        if not email:
            return Response({'error': 'Email required.'}, status=400)

        try:
            user_resume = UserResume.objects.get(email=email)
            return Response({
                'email': email,
                'resume': user_resume.resume
            }, status=200)
        except UserResume.DoesNotExist:
            return Response({'error': 'Resume not found.'}, status=404)


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def create_user(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')

        if Company.objects.filter(email=email).exists():
            return Response({'error': 'User already exists'}, status=400)

        data = request.data.copy()
        data['password'] = make_password(password)

        serializer = CompanySerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User created'}, status=201)
        else:
            return Response({'error': serializer.errors}, status=400)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
        company = Company.objects.get(email=email)
        if check_password(password, company.password):
            return Response({
                "success": True,
                "message": "Login successful",
                "recruiter": {
                    "_id": company._id,
                    "company_name": company.company_name,
                    "email": company.email,
                    "image": request.build_absolute_uri(company.image.url) if company.image else "" 
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "success": False,
                "error": "Invalid credentials"
            }, status=401)
    except Company.DoesNotExist:
        return Response({
            "success": False,
            'message': 'User does not exist'
        }, status=404)


@api_view(['POST'])
def reset_password(request):
    email = request.data.get('email')
    new_password = request.data.get('new_password')

    try:
        company = Company.objects.get(email=email)
        company.password = make_password(new_password)
        company.save()
        return Response({'message': 'Password reset successful'})
    except Company.DoesNotExist:
        return Response({'error': 'Email not found'}, status=404)
