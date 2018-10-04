import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../core/auth.service';
import { PostService } from '../post.service';
import { AngularFireStorage } from '@angular/fire/storage';


@Component({
  selector: 'app-post-dashboard',
  templateUrl: './post-dashboard.component.html',
  styleUrls: ['./post-dashboard.component.css']
})
export class PostDashboardComponent implements OnInit {
  content: string;
  image: string;
  title: string;

  saving = 'Create Post';

  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;

  constructor(
    private auth: AuthService,
    private postService: PostService,
    private storage: AngularFireStorage
  ) {}

  ngOnInit() {}

  createPost() {
    const postData = {
      author: this.auth.authState.displayName || this.auth.authState.email,
      authorId: this.auth.currentUserId,
      content: this.content,
      image: this.image || null,
      published: new Date(),
      title: this.title
    };
    this.postService.create(postData);
    this.title = '';
    this.content = '';
    this.image = '';

    this.saving = 'Post Created!';
    setTimeout(() => (this.saving = 'Create Post'), 3000);
  }

  uploadImage(event) {
    const file = event.target.files[0]
    const path = `posts/${file.name}`
    const fileref= this.storage.ref(path);
    if (file.type.split('/')[0] !== 'image') {
      return alert('only image files')
    } else {
      const task = this.storage.upload(path, file);
      const ref = this.storage.ref(path);
      this.uploadPercent = task.percentageChanges();
      console.log('Image Uploaded!');
      task.snapshotChanges().pipe(
         finalize(() => {
           this.downloadURL = ref.getDownloadURL()
           this.downloadURL.subscribe(url => (this.image = url));
         })
      )
      .subscribe()
      

    }
  }




}
