import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData ,doc, onSnapshot, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from '@angular/fire/firestore';
import { Note } from '../interfaces/note.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  normalMarkedNotes: Note[] = [];

  unsubTrash;
  unsubNotes;
  unsubedMarkedNotes;

  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubNotes = this.subNotesList();
    this.unsubedMarkedNotes = this.subMarkedNotesList();
    this.unsubTrash = this.subTrashList();
    
  }

  async deleteNote(colId: "notes" | "trash", docId:string) {
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch(
      (err) => { console.log(err);
       }
    )
  }

  async updateNote(note: Note) {
    if (note.id) {
      let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id)
      await updateDoc(docRef, this.getCleanJson(note)).catch(
        (err) => { console.error(err); }
      );
    }
  }

  getCleanJson(note:Note): {} {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    }
  }


  getColIdFromNote(note:Note) {
    if(note.type === 'note') {
      return 'notes'
    } else {
      return 'trash'
    }
  }

  // async addNote(item: Note, colId: "notes" | "trash") {
  //   if(colId === "notes") {
  //     await addDoc(this.getNotesRef(), item).catch(
  //       (err) => { console.error(err) }
  //     ).then(
  //       (docRef) => { console.log("Document written with ID: ", docRef?.id) }
  //     )
  //   } else {
  //     await addDoc(this.getTrashRef(), item).catch(
  //       (err) => { console.error(err) }
  //     ).then(
  //       (docRef) => { console.log("Document written with ID: ", docRef?.id) }
  //     )
  //   }
  // }

  async addNote(item: Note, colId: "notes" | "trash") {
    const ref = colId === "notes" ? this.getNotesRef() : this.getTrashRef();
    await addDoc(ref, item).catch(
      (err) => { console.error(err) }
    ).then(
      (docRef) => { console.log("Document written with ID: ", docRef?.id) }
    );
  }



  ngOnDestroy() {
    // deabonniert die Listener um Speicherlecks zu vermeiden
    this.unsubNotes();
    this.unsubTrash();
    this.unsubedMarkedNotes();
  }


  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = []
      list.forEach(element => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id))
      })
    })
  }

  subNotesList() {
    const q = query(this.getNotesRef(), where("marked", "==", false) , limit(100));
    return onSnapshot(q, (list) => {
      this.normalNotes = []
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id))
      });
      list.docChanges().forEach((change) => {
        if (change.type === "added") {
            console.log("New note: ", change.doc.data());
        }
        if (change.type === "modified") {
            console.log("Modified note: ", change.doc.data());
        }
        if (change.type === "removed") {
            console.log("Removed note: ", change.doc.data());
        }
      });
    })
  }

  // ########## Beispiel für Subcollections ##########
  // subNotesList() {
  //   let ref = (collection(this.firestore, "notes/70m8fu4mkrbvmf4CLPve/subcollection"))
  //   const q = query(ref, limit(100));
  //   return onSnapshot(q, (list) => {
  //     this.normalNotes = []
  //     list.forEach(element => {
  //       this.normalNotes.push(this.setNoteObject(element.data(), element.id))
  //     });
  //   })
  // }

  subMarkedNotesList() {
    const q = query(this.getNotesRef(), where("marked", "==", true), limit(100));
    return onSnapshot(q, (list) => {
      this.normalMarkedNotes = []
      list.forEach(element => {
        this.normalMarkedNotes.push(this.setNoteObject(element.data(), element.id))
      })
    })
  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id,
      type: obj.type || "note",
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false,
    }
  }


  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getSingleDocRef(colId: string, docId:string) {
    return doc(collection(this.firestore, colId), docId);
  }

}
