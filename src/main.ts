import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

console.log('Iniciando aplicação...');

bootstrapApplication(AppComponent, appConfig)
  .then(() => console.log('Aplicação iniciada com sucesso!'))
  .catch(err => {
    console.error('Erro ao iniciar aplicação:', err);
    console.error('Stack:', err.stack);
  });