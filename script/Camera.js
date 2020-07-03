import Utils from './Utils.js';
import Node from './Node.js';

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

export default class Camera extends Node {

    constructor(options) {
        super(options);

        this.aspect = 1
        this.fov = 1.67
        this.near = 0.05
        this.far = 100
        this.velocity = [0, 0, 0]
        this.mouseSensitivity = 0.002
        this.maxSpeed = 30
        this.friction = 1
        this.acceleration = 100

        Utils.init(this, this.constructor.defaults, options);

        this.projection = mat4.create();
        this.updateProjection();

        // this.mousemoveHandler = this.mousemoveHandler.bind(this);
        this.keydownHandler = this.keydownHandler.bind(this);
        this.keyupHandler = this.keyupHandler.bind(this);
        this.keys = {};
        this.keys["KeyW"]=true
        this.enable()

        this.startMilis = new Date().getTime()
        this.milis = 0
        this.gameover = false
        
    }

    updateProjection() {
        mat4.perspective(this.projection, this.fov, this.fov, this.near, this.far);
    }

    update(dt) {
        
        if(this.gameover){
            return
        }
        
        const c = this;

        const forward = vec3.set(vec3.create(),
            -Math.sin(c.rotation[1]), 0, -Math.cos(c.rotation[1]));
        const right = vec3.set(vec3.create(),
            Math.cos(c.rotation[1]), 0, -Math.sin(c.rotation[1]));



        // 1: add movement acceleration
        let acc = vec3.create();
        if (this.keys['KeyW']) {
            vec3.add(acc, acc, forward);
        }
        if (this.keys['KeyS']) {
            vec3.sub(acc, acc, forward);
        }
        if (this.keys['KeyD']) {
            vec3.add(acc, acc, right);
        }
        if (this.keys['KeyA']) {
            vec3.sub(acc, acc, right);
        }

        // 2: update velocity
        vec3.scaleAndAdd(c.velocity, c.velocity, acc, dt * c.acceleration);

        // 3: if no movement, apply friction
        if (!this.keys['KeyD'] &&
        !this.keys['KeyW'] &&
            !this.keys['KeyA']) {
            vec3.scale(c.velocity, [0,0,0], 0);
        }

        // 4: limit speed
        const len = vec3.len(c.velocity);
        if (len > c.maxSpeed) {
            vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
        }

        this.milis = new Date().getTime()-this.startMilis
        this.maxSpeed = this.milis/1000 +10
        return this.maxSpeed
    }

    enable() {
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }

    disable() {
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);

        for (let key in this.keys) {
            this.keys[key] = false;
        }
    }

    keydownHandler(e) {
        this.keys[e.code] = true;
    }

    keyupHandler(e) {
        if(e.code=="KeyW"){
            return
        }
        this.keys[e.code] = false;
    }
}