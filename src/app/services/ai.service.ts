import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

interface ApiResponse {
  answer: string; 
}

@Injectable({
  providedIn: 'root'
})

export class AiService {

  constructor(private http: HttpClient) { }


  enviarPrompt(userPrompt: string): Observable<string> {
    
    const API_URL = 'http://3.22.97.3:3000/agent/ai/ask'; 

    const body = { question: userPrompt }; 
    console.log('[AiService] POST', API_URL, body);

    // O AuthInterceptor adiciona automaticamente o token no header
    return this.http.post<ApiResponse>(API_URL, body).pipe(
      tap({
        next: res => console.log('[AiService] resposta API:', res),
        error: err => console.error('[AiService] erro API:', err)
      }),
      map(apiResponse => apiResponse.answer)
    );
  }
}