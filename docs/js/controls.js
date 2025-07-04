// controls.js
import * as THREE from "three";

const FORWARD = 0;
const LEFT = 1;
const BACKWARD = 2;
const RIGHT = 3;

const MIN_ZOOM = Math.PI / 180.0;
const MAX_ZOOM = Math.PI / 4.0;
const MAX_PITCH = Math.PI / 2.02;

export class CustomControls {
  constructor(camera, domElement, speed = 2.5) {
    this.camera = camera;
    this.domElement = domElement;

    this.pos = camera.position.clone();
    this.up = new THREE.Vector3(0, 1, 0);
    this.lookAt = new THREE.Vector3();
    this.right = new THREE.Vector3();
    this.worldUp = new THREE.Vector3(0, 1, 0);

    this.yaw = -Math.PI / 2.0;
    this.pitch = 0.0;
    this.zoom = Math.PI / 4.0;

    this.mouseSensitivity = 0.001;
    this.zoomSensitivity = 0.0005;
    this.speed = speed;

    this.mouseMove = false;
    this.lastX = 0;
    this.lastY = 0;

    this.viewMatrix = new THREE.Matrix4();

    this.sign = [1, -1, -1, 1]; // FORWARD, LEFT, BACKWARD, RIGHT
    this.vec = [this.lookAt, this.right, this.lookAt, this.right];

    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false, // Q
      down: false, // E
    };

    this.initListeners();
    this.updateVectors();
  }

  initListeners() {
    this.domElement.addEventListener("mousedown", (e) => {
      this.mouseMove = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    this.domElement.addEventListener("mouseup", () => {
      this.mouseMove = false;
    });

    this.domElement.addEventListener("mousemove", (e) => {
      if (!this.mouseMove) return;
      const offsetX = e.clientX - this.lastX;
      const offsetY = this.lastY - e.clientY;

      this.processPov(offsetX, offsetY);
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    });

    this.domElement.addEventListener("wheel", (e) => {
      this.processScroll(e.deltaY);
    });

    document.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "KeyW":
          this.keys.forward = true;
          break;
        case "KeyS":
          this.keys.backward = true;
          break;
        case "KeyA":
          this.keys.left = true;
          break;
        case "KeyD":
          this.keys.right = true;
          break;
        case "KeyQ":
          this.keys.up = true;
          break;
        case "KeyE":
          this.keys.down = true;
          break;
      }
    });

    document.addEventListener("keyup", (e) => {
      switch (e.code) {
        case "KeyW":
          this.keys.forward = false;
          break;
        case "KeyS":
          this.keys.backward = false;
          break;
        case "KeyA":
          this.keys.left = false;
          break;
        case "KeyD":
          this.keys.right = false;
          break;
        case "KeyQ":
          this.keys.up = false;
          break;
        case "KeyE":
          this.keys.down = false;
          break;
      }
    });
  }

  processScroll(yOffset) {
    this.zoom -= yOffset * this.zoomSensitivity;
    this.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this.zoom));
    this.camera.fov = THREE.MathUtils.radToDeg(this.zoom);
    this.camera.updateProjectionMatrix();
  }

  processPov(xOffset, yOffset, constrainPitch = true) {
    this.yaw += xOffset * this.mouseSensitivity;
    this.pitch += yOffset * this.mouseSensitivity;

    if (constrainPitch) {
      this.pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, this.pitch));
    }

    this.updateVectors();
  }

  processKeyboard(direction, deltaTime) {
    const velocity = this.sign[direction] * this.speed * deltaTime;
    const vec = this.vec[direction].clone().multiplyScalar(velocity);
    this.pos.add(vec);
    this.updateVectors();
  }

  updateVectors() {
    this.lookAt.set(Math.cos(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), Math.sin(this.yaw) * Math.cos(this.pitch)).normalize();

    this.right.crossVectors(this.lookAt, this.worldUp).normalize();
    this.up.crossVectors(this.right, this.lookAt).normalize();

    // Update camera position and rotation
    this.camera.position.copy(this.pos);
    const target = this.pos.clone().add(this.lookAt);
    this.camera.lookAt(target);
  }

  update(deltaTime) {
    if (this.keys.forward) this.processKeyboard(FORWARD, deltaTime);
    if (this.keys.backward) this.processKeyboard(BACKWARD, deltaTime);
    if (this.keys.left) this.processKeyboard(LEFT, deltaTime);
    if (this.keys.right) this.processKeyboard(RIGHT, deltaTime);
    if (this.keys.up) {
      this.pos.addScaledVector(this.worldUp, this.speed * deltaTime);
    }
    if (this.keys.down) {
      this.pos.addScaledVector(this.worldUp, -this.speed * deltaTime);
    }
    this.updateVectors();
  }
}
