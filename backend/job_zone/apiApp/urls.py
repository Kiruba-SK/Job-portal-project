from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apiApp.views import ( 
    JobViewSet, login, create_user, reset_password, 
    ApplyToJobView, ApplicationListAPIView, 
    UserApplicationsAPIView, UploadResumeAPIView,
    UserResumeRetrieveAPIView ,CompanyApplicationsList, 
    UpdateApplicationStatusAPIView 
)

router = DefaultRouter()
router.register(r'jobs', JobViewSet, basename='jobs')

urlpatterns = [
    path('login/', login,name='login'),
    path('sign-up/', create_user,name='sign-up'),
    path('reset-password/', reset_password, name='reset-password'),
    path('', include(router.urls)),
    path('apply/', ApplyToJobView.as_view(), name='apply-to-job'),
    path('applications/', ApplicationListAPIView.as_view(), name='view-applications'),
    path('user-applications/', UserApplicationsAPIView.as_view(), name='user_applications'),
    path('upload-resume/',UploadResumeAPIView.as_view(), name='upload_resume'),
    path('company-applications/', CompanyApplicationsList.as_view(), name='company-applications'),
    path('user-resume/', UserResumeRetrieveAPIView.as_view(), name='user-resume'),
     path('update-application-status/', UpdateApplicationStatusAPIView.as_view(), name='update-application-status'),
]  