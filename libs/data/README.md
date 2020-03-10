# data

This library was generated with [Nx](https://nx.dev).

`data` contains a single class `Todo` to be reused throughout the workspace

```typescript
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
```
