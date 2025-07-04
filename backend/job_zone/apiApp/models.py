from django.db import models
from django.contrib.auth.hashers import make_password, is_password_usable


# Create your models here.

class Company(models.Model):
    _id = models.AutoField(primary_key=True)
    company_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    image = models.FileField(upload_to='company_logos/', null=True, blank=True)

    def __str__(self):
        return self.company_name

    def save(self, *args, **kwargs):
        if not is_password_usable(self.password):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

class Job(models.Model):
    _id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    level = models.CharField(max_length=100)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    description = models.TextField()  
    salary = models.PositiveIntegerField()
    date = models.DateTimeField() 
    category = models.CharField(max_length=100)
    visible = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class Application(models.Model):
    user_email = models.EmailField(null=True, blank=True) 
    user_name = models.CharField(max_length=100, null=True, blank=True)
    user_img = models.URLField(null=True, blank=True)    
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    resume = models.URLField() 
    status = models.CharField(max_length=10, default='Pending')  
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user_email} - {self.job.title}"

class UserResume(models.Model):
    email = models.EmailField(unique=True)
    resume = models.URLField()
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email