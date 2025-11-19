import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { AuthService } from './auth.service';

interface ApiResponse {
  answer: string; 
}

@Injectable({
  providedIn: 'root'
})

export class AiService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }


  enviarPrompt(userPrompt: string): Observable<string> {
    
    const API_URL = 'http://localhost:4000/agent/ai/ask'; 

    // Usar o método getToken() do AuthService
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    });

    const body = { question: userPrompt }; 
    console.log('[AiService] POST', API_URL, body);

    return this.http.post<ApiResponse>(API_URL, body, { headers }).pipe(
      tap({
        next: res => console.log('[AiService] resposta API:', res),
        error: err => console.error('[AiService] erro API:', err)
      }),
      map(apiResponse => apiResponse.answer)
    );
  }
}