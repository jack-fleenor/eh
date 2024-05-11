import {
  AfterViewInit,
  Component,
  ElementRef,
  Host,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

class Circle {
  constructor(
    public x: number,
    public y: number,
    public r: number,
    public context: CanvasRenderingContext2D,
    public canvas: HTMLCanvasElement
  ) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.context = context;
    this.canvas = canvas;
  }

  distance(circle: Circle): number {
    const dx = this.x - circle.x; // line a
    const dy = this.y - circle.y; // line b
    // Pythagorean theorem (c = sqrt(a^2 + b^2))
    return Math.sqrt(dx * dx + dy * dy);
  }

  overlap(circle: Circle): boolean {
    const radii = this.r + circle.r;
    const distance = this.distance(circle);
    return distance < radii;
  }

  public outOfBounds(x: number, y: number): boolean {
    return (
      x + this.r > this.canvas.width ||
      y + this.r > this.canvas.height ||
      x - this.r < 0 ||
      y - this.r < 0
    );
  }
  
  draw(): void {
    this.context.lineWidth = 0;
    this.context.fillStyle = 'red';
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
    this.context.fill();
  }
  clear(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

class Player extends Circle {
  moving: boolean = false;
  constructor(x: number, y: number, r: number, context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    super(x, y, r, context, canvas);
    this.moving = false;
  }
  public move(x: number, y: number): void {
    const outOfBounds = this.outOfBounds(x, y);
    if(outOfBounds) {
      if (this.moving) {
        this.stop();
      }
      return;
    }
    if(!this.moving){
      this.moving = true;
    }
    this.x = x;
    this.y = y;
    this.clear();
    this.draw();
    this.moving = true;
  }
  public stop(): void {
    this.moving = false;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  player: Player;
  playerB: Player;
  container: HTMLDivElement;
  
  constructor(private elementRef: ElementRef) {
    this.canvas = null as any;
    this.context = null as any;
    this.container = document.getElementById('container') as HTMLDivElement;
    this.player = null as any;
    this.playerB = null as any;
  }

  ngOnInit(): void {
    this.canvas = this.elementRef.nativeElement.querySelector('canvas');
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.player = new Player(50, 50, 10, this.context, this.canvas);
    this.playerB = new Player(70, 70, 10, this.context, this.canvas);
    this.player.draw();
    this.playerB.draw();
  }

  public handleControllerInput(event: KeyboardEvent): void {
    // Basic collision resolution
    switch (event.key) {
      case 'ArrowRight':
        this.player.move(this.player.x + 10, this.player.y);
        if (this.player.overlap(this.playerB)) {
          this.player.move(this.player.x - 10, this.player.y);
        }
        break;
      case 'ArrowLeft':
        this.player.move(this.player.x - 10, this.player.y);
        if (this.player.overlap(this.playerB)) {
          this.player.move(this.player.x + 10, this.player.y);
        }
        break;
      case 'ArrowUp':
        this.player.move(this.player.x, this.player.y - 10);
        if (this.player.overlap(this.playerB)) {
          this.player.move(this.player.x, this.player.y + 10);
        }
        break;
      case 'ArrowDown':
        this.player.move(this.player.x, this.player.y + 10);
        if (this.player.overlap(this.playerB)) {
          this.player.move(this.player.x, this.player.y - 10);
        }
        break;
      default:
        break;
    }
    this.player.draw();
    this.playerB.draw();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    this.handleControllerInput(event);
  }
  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (
      event.key === 'ArrowRight' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowUp' ||
      event.key === 'ArrowDown'
    ) {
      this.player.stop();
    }
  }
}
