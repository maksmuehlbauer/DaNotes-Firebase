import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), importProvidersFrom(provideFirebaseApp(() => initializeApp({
    "projectId":"danotes-83926","appId":"1:875896041128:web:f749b787d7e2ffd6741c9d",
    "storageBucket":"danotes-83926.appspot.com",
    "apiKey":"AIzaSyB0PCUAHD-oImKp16h9_SPfi4-ot1Qhn14",
    "authDomain":"danotes-83926.firebaseapp.com",
    "messagingSenderId":"875896041128"}))), 
    importProvidersFrom(provideFirestore(() => getFirestore()))]
};
