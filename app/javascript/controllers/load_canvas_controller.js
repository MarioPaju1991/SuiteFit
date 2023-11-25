import { Controller } from "@hotwired/stimulus"
import { fabric } from "fabric"

// Connects to data-controller="load-canvas"
export default class extends Controller {
  static targets = ["canvas", "my-image"]
  static values = {
    json: Object,
  }

  connect() {
    // create empty canvas
    this.canvas = new fabric.Canvas("new-canvas", {
      height: 800,
      width: 800,
    })
    // call function to load canvas from existing bookmark.arrangement or apartment.floor_plan json
    this.loadCanvas(this.canvas, this.jsonValue)
    // TODO: Not functioning??
    this.setBoundaries(this.canvas)

    // get ahold of all items to detect collisions
    const onChange=(options) => {
      options.target.setCoords();
      this.canvas.forEachObject(function(obj) {
        if (obj === options.target) return;
        // change user items' color/opacity
        if (obj.type !== "rect") {
          obj.set('fill' ,options.target.intersectsWithObject(obj) ? "#f55" : '#aac');
          obj.set('opacity' ,options.target.intersectsWithObject(obj) ? 0.5 : 1)
        }
        // change floor plan borders' color/opacity (all are rectangles)
        else {
          obj.set('fill' ,options.target.intersectsWithObject(obj) ? "#f55" : 'white');
          obj.set('opacity' ,options.target.intersectsWithObject(obj) ? 0.5 : 0);
          obj.set('selectable', false);
        }
      });
    }
    // trigger onChange method in the following situations
    this.canvas.on({
      'object:moving': onChange,
      'object:scaling': onChange,
      'object:rotating': onChange,
    });

    // TODO: Try to get objects to change opacity when hovered over?
    // this.canvas.on('mouse:over', function(e) {
    //   e.target.set('opacity', .5);
    //   canvas.renderAll();
    // });

    // this.canvas.on('mouse:out', function(e) {
    //   e.target.set('opacity', 1);
    //   canvas.renderAll();
    // });
  }

  // method to add clicked item to canvas
  add(event) {
    // find on-canvas length of main door, scale to size using standard 80 cm door
    let doorWidth = 0
    this.canvas._objects.forEach((obj) => {
      if (obj.fill === "#f00") {
        const door = obj
        doorWidth = door.width
        // if main door is on sides instead of top and bottom?
        // doorWidth = door.width > door.length ? door.width : door.length
      }
      return doorWidth
    })
    console.log(doorWidth)

    const ratio = doorWidth / 80.0
    console.log(ratio)
    // create instance of user item on canvas and scale with ratio
    // pass in data, note that length doesn't exist in fabric so it becomes height
    const triangle = new fabric.Triangle({
        height: parseInt(event.currentTarget.dataset.length) * ratio,
        width: parseInt(event.currentTarget.dataset.width) * ratio,
        fill: '#aac',
        originX: 'left',
        originY: 'top',
        hasBorders: false,
        lockScalingX: true,
        lockScalingY: true,
        transparentCorners: false,
        cornerSize: 10,
        cornerStrokeColor: "black",
        cornerColor: "blue",
        cornerStyle: "circle",
        snapAngle: 45,
        hasRotatingPoint: true,
        rotatingPointOffset: 20
      })

      triangle.setControlsVisibility({
        tl:false,
        mt:false,
        tr:false,
        ml:false,
        mr:false,
        bl:false,
        mb:false,
        br:false
       })

      this.canvas.add(triangle)
  }

  // method to clear the canvas
  clear(event) {
    this.canvas.getObjects().forEach((obj) => {
      if(obj !== this.canvas.backgroundImage && obj.type !== "rect"){
        this.canvas.remove(obj)
      }
    })
  }

  // method to delete one item
  delete(event) {
    console.log("hi")
    this.canvas.on('selection:created', function(options) {
      // console.log(options)
        // objToDelete = object.target.setCoords();
        // this.canvas.remove(objToDelete)
      })
    }

  // method to save arrangement
  save(event) {
    fetch(`/bookmarks/${event.currentTarget.dataset.bookmark}`, {
      method: "PATCH",
      body: JSON.stringify(this.canvas),
      headers: {
        "X-CSRF-Token": this.getMetaValue("csrf-token")
      }
    }).then(console.log("Success"))
  }

  // function to deserialize json and render apartment.floor_plan or bookmark.arrangement
  loadCanvas(canvas, json) {
    return canvas.loadFromJSON(json, canvas.renderAll.bind(canvas));
  }

  // supposed to make all boundaries unselectable but not working for some reason
  setBoundaries(canvas) {
    canvas.forEachObject((obj) => {
      obj.set('selectable', false)
    })
  }

  // method to be used in save function
  getMetaValue(name) {
    const element = document.head.querySelector(`meta[name="${name}"]`)
    return element.getAttribute("content")
  }
}

    // canvas.renderAll();
