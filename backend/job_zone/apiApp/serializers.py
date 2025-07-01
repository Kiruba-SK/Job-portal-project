from rest_framework import serializers
from .models import Company, Job, Application
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['_id', 'company_name', 'email', 'password', 'image']
        extra_kwargs = {
            'password': {'write_only': True},
            'image': {'required': True}
        }

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)


class JobSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    company_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Job 
        fields = ['_id', 'title', 'location', 'level', 'company', 'company_id', 'description', 'salary', 'date', 'category', 'visible']



class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    resume = serializers.URLField()
    user_img = serializers.URLField()

    class Meta:
        model = Application
        fields = ['id', 'user_email', 'user_name', 'user_img', 'job', 'resume', 'status', 'applied_at']
    

    def get_resume(self, obj):
        request = self.context.get('request')
        if request and obj.resume and hasattr(obj.resume, 'url'):
            return request.build_absolute_uri(obj.resume.url)
        return None

    def get_user_img(self, obj):
        request = self.context.get('request')
        if request and obj.user_img and hasattr(obj.user_img, 'url'):
            return request.build_absolute_uri(obj.user_img.url)
        return None


class ResumeUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ['user_email', 'job', 'resume']