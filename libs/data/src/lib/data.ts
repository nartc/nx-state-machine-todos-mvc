export class Todo {
  title: string;
  completed: boolean;
  id: number;

  constructor(title: string) {
    this.title = title;
    this.completed = false;
    this.id = Date.now();
  }
}
