from django.contrib import admin
from .models import Company, Job, Application, UserResume
from django.utils.html import format_html

# Register your models here.

class JobInline(admin.TabularInline):   
    model = Job
    extra = 0
    show_change_link = True
    readonly_fields = ('_id', 'title', 'location', 'level', 'salary', 'date', 'category')


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('_id', 'company_name', 'email', 'job_count')  
    readonly_fields = ('_id',)
    inlines = [JobInline]
    search_fields = ('company_name', 'email')
    list_filter = ('email',)
    fields = ('_id', 'company_name', 'email', 'password', 'image')

    def job_count(self, obj):
        return obj.job_set.count()  
    job_count.short_description = 'Job Count'


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('_id', 'title', 'company', 'location', 'level', 'salary', 'date', 'category')
    search_fields = ('title', 'location', 'company__company_name')
    list_filter = ('company', 'level', 'category') 
    readonly_fields = ('_id',)


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('user_email', 'job', 'status', 'applied_at', 'resume_link')
    search_fields = ('user_email', 'job__title', 'status')
    list_filter = ('status', 'applied_at')
    readonly_fields = ('applied_at',)

    def resume_link(self, obj):
        if obj.resume:
            return format_html("<a href='{}' target='_blank'>Download</a>", obj.resume)
        return "-"
    resume_link.short_description = 'Resume'
    
    
@admin.register(UserResume)
class UserResumeAdmin(admin.ModelAdmin):
    list_display = ('email', 'uploaded_at', 'resume_link')
    search_fields = ('email',)
    readonly_fields = ('uploaded_at',)

    def resume_link(self, obj):
        if obj.resume:
            return format_html("<a href='{}' target='_blank'>Download</a>", obj.resume)
        return "-"
    resume_link.short_description = 'Resume'
