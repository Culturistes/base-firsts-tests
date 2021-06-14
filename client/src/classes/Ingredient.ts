export default class Ingredient {
  name: string;
  img: string;
  x: number;
  y: number;

  size = 50;
  velocity = 1.5;

  constructor(ingredient: any, x: number, y: number) {
    this.name = ingredient.name;
    this.img = ingredient.img;
    this.x = x;
    this.y = y;
  }

  update(ctx: any, mouse: any) {
    this.y = Math.round(this.y + this.velocity);

    if (this.isHover(mouse)) {
      this.y = window.innerHeight + 1000;
    }

    this.draw(ctx);
  }

  draw(ctx: any) {
    ctx.fillStyle = this.img;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }

  isHover(mouse: any) {
    if (
      mouse.x >= this.x &&
      mouse.x <= this.x + this.size &&
      mouse.y >= this.y &&
      mouse.y <= this.y + this.size
    ) {
      return true;
    }
    return false;
  }
}
