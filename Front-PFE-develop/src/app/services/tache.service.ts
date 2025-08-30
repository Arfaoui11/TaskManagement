import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Tache } from '../models/tache.models';

@Injectable({
  providedIn: 'root'
})
export class TacheService {
  private baseUrl = 'http://localhost:8000/api1/taches';

  // Observable pour notifier les changements
  private taskChanges = new Subject<void>();
  taskChanges$ = this.taskChanges.asObservable();

  constructor(private http: HttpClient) {}

  getAll(): Observable<Tache[]> {
    return this.http.get<Tache[]>(this.baseUrl);
  }

  getById(id: number): Observable<Tache> {
    return this.http.get<Tache>(`${this.baseUrl}/${id}`);
  }

  create(tache: Tache): Observable<Tache> {
  const sanitized = this.sanitizeTache(tache);
  return this.http.post<Tache>(this.baseUrl, sanitized).pipe(
    tap(() => this.taskChanges.next())
  );
}

update(id: number, tache: Tache): Observable<Tache> {
  const sanitized = this.sanitizeTache(tache);
  return this.http.put<Tache>(`${this.baseUrl}/${id}`, sanitized).pipe(
    tap(() => this.taskChanges.next())
  );
}

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this.taskChanges.next()) // notifier après suppression
    );
  }

  getTachesByProjetId(projetId: number): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.baseUrl}/projets/${projetId}`);
  }

  updateTacheDates(id: number, dateDebut: Date, dateFin: Date): Observable<Tache> {
    const updateData = {
      dateDebut: dateDebut.toISOString(),
      dateFin: dateFin.toISOString()
    };

    return this.http.patch<Tache>(`${this.baseUrl}/${id}/dates`, updateData).pipe(
      tap(() => this.taskChanges.next()) // notifier après modification des dates
    );
  }
  private sanitizeTache(tache: Tache): Partial<Tache> {
  const cleaned = { ...tache };
  delete cleaned.prioriteLibelle;
  delete cleaned.statutLibelle;
  delete cleaned.createdAt;
  delete cleaned.updatedAt;
  return cleaned;
}

}
