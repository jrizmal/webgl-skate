import Application from './Application.js';

import Renderer from './Renderer.js';
import Physics from './Physics.js';
import Camera from './Camera.js';
import SceneLoader from './SceneLoader.js';
import SceneBuilder from './SceneBuilder.js';
class App extends Application {

    getRandomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    start() {
        const gl = this.gl;

        this.renderer = new Renderer(gl);
        this.time = Date.now();
        this.startTime = this.time;
        this.aspect = 0.5;
        this.score = 0
        this.scoreSpan = document.getElementById("score")
        this.hsBtn = document.getElementById("add-highscore-button");
        this.hsName = document.getElementById("score-name-text")

        this.hsBtn.onclick = (e) => {
            let currentScores = Object.assign([], JSON.parse(localStorage.getItem("score")))
            currentScores.push({
                name: this.hsName.value,
                score: this.score
            })
            localStorage.setItem("score", JSON.stringify(currentScores))
            this.hsBtn.style = "display: none;"
            this.hsName.style = "display: none;"
        }

        // this.pointerlockchangeHandler = this.pointerlockchangeHandler.bind(this);
        // document.addEventListener('pointerlockchange', this.pointerlockchangeHandler);

        //TODO: Generiraj svet
        let sceneJson = {
            nodes: [
                {
                    type: "camera",
                    translation: [0, 2, 0],
                    aabb: {
                        min: [-0.5, -0.5, -0.5],
                        max: [0.5, 0.5, 0.5]
                    },
                    aspect: 1,
                    fov: 1,
                    near: 0.01,
                    far: 100
                }
            ],
            textures: [
                "./models/textures/crate-diffuse.png",
                "./models/textures/grass.png",
                "./models/textures/floor.png",
                "./models/textures/dirt.png",
                "./models/textures/hypercube.png",
                "./models/textures/red.png",
                "./models/textures/barrel_side.png",
                "./models/textures/window.png"
            ],
            meshes: [
                "./models/meshes/cube.json",
                "./models/meshes/floor.json",
                "./models/meshes/grass.json",
                "./models/meshes/leftslope.json",
                "./models/meshes/rightslope.json",
                "./models/meshes/barrel.json",
                "./models/meshes/leftTower.json",
                "./models/meshes/rightTower.json"
            ]
        }

        // generiraj cel level
        // 100 segmentov
        for (let i = 0; i < 200; i++) {
            this.generateSegment(i * 10).forEach(node => {
                sceneJson.nodes.push(node)
            });
        }

        this.load(sceneJson);
    }

    generateSegment(zOffset) {

        let nodes = []
        // neboticnik 1
        nodes.push({
            "type": "model",
            "mesh": 6,
            "texture": 7,
            "aabb": {
                "min": [0, 0, 0],
                "max": [0, 0, 0]
            },
            "translation": [this.getRandomBetween(1, 10), 0, -zOffset + this.getRandomBetween(0, 7)]
        })
        nodes.push({
            "type": "model",
            "mesh": 7,
            "texture": 7,
            "aabb": {
                "min": [0, 0, 0],
                "max": [0, 0, 0]
            },
            "translation": [-this.getRandomBetween(1, 10), 0, -zOffset + this.getRandomBetween(0, 7)]
        })
        // podlaga
        nodes.push({
            "type": "model",
            "mesh": 1,
            "texture": 2,
            "aabb": {
                "min": [0, 0, 0],
                "max": [0, 0, 0]
            },
            "translation": [0, 0, -zOffset]
        })
        nodes.push({
            "type": "model",
            "mesh": 2,
            "texture": 1,
            "aabb": {
                "min": [0, 0, 0],
                "max": [0, 0, 0]
            },
            "translation": [0, 0, -zOffset]
        })
        nodes.push({
            "type": "model",
            "mesh": 3,
            "texture": 3,
            "aabb": {
                "min": [0, 0, 0],
                "max": [0, 0, 0]
            },
            "translation": [0, 0, -zOffset]
        })
        nodes.push({
            "type": "model",
            "mesh": 4,
            "texture": 3,
            "aabb": {
                "min": [0, 0, 0],
                "max": [0, 0, 0]
            },
            "translation": [0, 0, -zOffset]
        })
        // kocka
        if (zOffset > 50) {
            // nakljucno postavi ovire
            let r = Math.random()
            if (r < 0.66) {
                // zaboj
                nodes.push({
                    "type": "model",
                    "mesh": 0,
                    "texture": 0,
                    "aabb": {
                        "min": [-1, -1, -1],
                        "max": [1, 1, 1]
                    },
                    "translation": [this.getRandomBetween(-4, 4), 1, -zOffset]
                })
            }
            else {
                // sod
                nodes.push({
                    "type": "model",
                    "mesh": 5,
                    "texture": 6,
                    "aabb": {
                        "min": [-1, -1, -1],
                        "max": [1, 1, 1]
                    },
                    "translation": [this.getRandomBetween(-4, 4), 1, -zOffset]
                })
            }
        }
        return nodes
    }



    async load(uri) {
        const scene = await new SceneLoader().loadScene(uri);
        const builder = new SceneBuilder(scene);
        this.scene = builder.build();


        // Find first camera.
        this.camera = null;
        this.scene.traverse(node => {
            if (node instanceof Camera) {
                this.camera = node;
            }
        });
        this.physics = new Physics(this.scene, this.camera);

        this.camera.aspect = this.aspect;
        this.camera.updateProjection();
        await this.renderer.prepare(this.scene);

    }

    update() {
        const t = this.time = Date.now();
        const dt = (this.time - this.startTime) * 0.001;
        this.startTime = this.time;

        if (this.camera) {
            let s = this.camera.update(dt)
            if (s) {
                this.score = (s - 10).toFixed(2)
                this.scoreSpan.innerHTML = this.score
            }


        }

        if (this.physics) {
            this.physics.update(dt);
        }
    }

    render() {
        if (this.scene) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        this.aspect = w / h;
        if (this.camera) {
            this.camera.aspect = this.aspect;
            this.camera.updateProjection();
        }
    }
}

window.onload = () => {
    let app
    const startButton = document.getElementById("start-button")
    const viewHSButton = document.getElementById("view-highscores-button")
    const restartbtn = document.getElementById("restart-btn")
    const mainMenuDiv = document.getElementById("main-menu")
    const highScoresDiv = document.getElementById("high-scores")
    const canvas = document.querySelector('canvas')
    const backToMainMenuButton = document.getElementsByClassName("back-to-menu-button")
    const mainMenuSlika = document.getElementById("menu-slika")
    const loadingScreen = document.getElementById("loading-screen")
    const songDisplay = document.getElementById("song-title")

    const music = ["Ludacris - Act A Fool",
        "Ooh Aah - My life be like - Grits",
        "Petey Pablo - Need For Speed",
        "Calm and the Storm",
        "Initial D - Deja Vu",
        "Initial D - Running In The 90's (Bass Boosted)",
        "Justice - D.A.N.C.E.",
        "MACINTOSH PLUS - 420",
        "NOMA - Brain Power",
        "Taking the hobbits to Isengard",
        "The Crystal Method - Born Too Slow",
        "Tokyo Drift - Teriyaki Boyz",
        "Tokyo DriftEurobeat Remix"
    ]

    let audio = new Audio("music/Get Low  - Lil Jon"+".mp3");
    audio.play()
    const startGame = () => {
        var elem = document.getElementById("myBar");
        loadingScreen.style = "display:block;"
        let progress = 0
        let intervalId = setInterval(() => {
            if (progress >= 100) {
                clearInterval(intervalId)
                loadingScreen.style = "display:none;"
                changeSong()
            }
            progress++
            elem.style.width = progress + "%";

        }, 10)
        app = new App(canvas)
        window.onresize = app.resize()
    }

    const changeSong = () => {
        let newsong = music[Math.floor(Math.random() * music.length)];

        songDisplay.innerHTML = "Now playing:<br>"+newsong
        songDisplay.style.opacity = 1

        audio.src = "music/" + newsong+".mp3"
        audio.load()
        audio.play()

        setTimeout(() => {
            songDisplay.style.opacity = 0
        }, 5000)
    }

    startButton.onclick = (e) => {
        mainMenuDiv.style = "display: none;"
        startGame()
    }

    for (let btn of backToMainMenuButton) {
        btn.onclick = (e) => {
            mainMenuDiv.style = "display: block;"
            highScoresDiv.style = "display: none;"
        }
    }

    restartbtn.onclick = (e) => {
        location.reload()
    }
}