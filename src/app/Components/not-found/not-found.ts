import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  imports: [],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css'
})
export class NotFound {

  ngOnInit(): void {
    const cursor = document.getElementById("cursor") as HTMLElement | null;

    if (cursor) {
      document.addEventListener('mousemove', (e: MouseEvent) => {
        cursor.style.left = `${e.pageX}px`;
        cursor.style.top = `${e.pageY}px`;
      });
    }
  }

}
