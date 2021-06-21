export default class Ingredient {
  name: string;
  img: any;
  imgHighlight: any;
  x: number;
  y: number;
  canBeDraw: boolean;

  size = 100;
  velocity = 1.5;

  constructor(ingredient: any, x: number, y: number) {
    this.name = ingredient.name;

    this.img = new Image();
    this.img.src = "/img/ingredients/" + ingredient.img + ".png";

    this.x = x;
    this.y = y;

    const alreadyLoaded = this.imageExists(
      "/img/ingredients/" + ingredient.img + ".png"
    );

    if (!alreadyLoaded) {
      this.canBeDraw = false;

      this.img.onload = () => {
        this.canBeDraw = true;
      };
    } else {
      this.canBeDraw = true;
    }
  }

  update(ctx: any, mouse: any, highlight: boolean) {
    this.y = Math.round(this.y + this.velocity);

    if (this.isHover(mouse)) {
      this.y = window.innerHeight + 100000;
    }

    this.draw(ctx, highlight);
  }

  draw(ctx: any, highlight = false) {
    const imgToDraw = highlight ? this.imgHighlight : this.img;
    ctx.drawImage(imgToDraw, this.x, this.y);
    //ctx.fillRect(this.x, this.y, this.size, this.size);
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

  imageExists(image_url: string) {
    const http = new XMLHttpRequest();

    http.open("HEAD", image_url, false);
    http.send();

    return http.status != 404;
  }
}
