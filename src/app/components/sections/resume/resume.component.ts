import { Component, OnInit } from '@angular/core';
import { ResumeService } from '../../../api/resume/resume.service'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resume',
  standalone: true,
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.css'],
  imports: [CommonModule] 
})
export class ResumeComponent implements OnInit {
  resumes: any[] = []; 
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private resumeService: ResumeService) {}

  ngOnInit(): void {
    this.loadResumes();
  }

  loadResumes(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.resumeService.getResumes().subscribe({
      next: (data) => {
        this.resumes = data.map((resume: any) => ({
          ...resume,
          expanded: false
        }));
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load resume data. Please refresh the page.';
        this.resumes = [];
      }
    });
  }

  toggleExpand(index: number): void {
    this.resumes[index].expanded = !this.resumes[index].expanded;
  }
}
