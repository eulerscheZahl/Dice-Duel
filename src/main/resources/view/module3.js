import * as THREE from './build/three.module.js';
import * as orbit from './jsm/controls/OrbitControls.js';
import { FBXLoader } from './jsm/loaders/FBXLoader.js';
import { assets } from './assets.js';

// https://stackoverflow.com/a/32038265
THREE.Object3D.prototype.rotateAroundWorldAxis = function() {
    var q = new THREE.Quaternion();
    return function rotateAroundWorldAxis( point, axis, angle ) {
        q.setFromAxisAngle( axis, angle );
        this.applyQuaternion( q );
        this.position.sub( point );
        this.position.applyQuaternion( q );
        this.position.add( point );
        return this;
    }
}();

export class module3 {
    cubes = []
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();

    static get name() {
        return 'board'
    }

    reinitScene(container, canvasData) {}

    rollDie(die, direction, t) {
        var s = { ...die.states[die.states.length-1] };
        if (s.t != t) die.states.push({...s, t:t})
        for (var i = 0; i < direction.length; i++) {
            s = { ...die.states[die.states.length-1], t:t+(i+1)/direction.length };
            die.testRotation.position.set(0,0,0)
            if (direction[i] == "L") { s.x--; s.point=new THREE.Vector3(-1,0,0); s.axis = new THREE.Vector3(0,0,1); s.angle = +Math.PI/2; }
            if (direction[i] == "R") { s.x++; s.point=new THREE.Vector3(+1,0,0); s.axis = new THREE.Vector3(0,0,1); s.angle = -Math.PI/2; }
            if (direction[i] == "U") { s.z++; s.point=new THREE.Vector3(0,0,+1); s.axis = new THREE.Vector3(1,0,0); s.angle = -Math.PI/2; }
            if (direction[i] == "D") { s.z--; s.point=new THREE.Vector3(0,0,-1); s.axis = new THREE.Vector3(1,0,0); s.angle = +Math.PI/2; }
            die.testRotation.rotateAroundWorldAxis(s.point, s.axis, s.angle)
            s.rx = die.testRotation.rotation.x
            s.ry = die.testRotation.rotation.y
            s.rz = die.testRotation.rotation.z
            die.states.push(s);
        }
    }

    updateScene(previousData, currentData, progress) {
        if (this.container.style.width != this.container.parentElement.clientWidth + "px") {
            const width = this.container.parentElement.clientWidth;
            const height = width * 9 / 16;
            this.container.style.width = width;
            this.container.style.height = height;
            this.container.children[0].style.width = width;
            this.container.children[0].style.height = height;

            this.renderer.setSize(width, height);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }

        var start = 0;
        if (currentData) start = currentData.number-1;
        const end = start + 1;
        const t = start + progress;

        for (var i = 0; i < this.cubes.length; i++) {
            const c = this.cubes[i];
            if (!c.model) continue
            var idx = 0;
            while (c.states.length > idx + 1 && c.states[idx + 1].t < t) idx++;
            var before = c.states[idx];
            var after = c.states[idx];
            var frac = 0
            if (idx + 1 < c.states.length) {
                after = c.states[idx + 1];
                frac = (t - before.t) / (after.t - before.t);
            }
            c.model.visible = before.visible
            if (before.x == after.x && before.y == after.y && before.z == after.z) {
                c.model.position.set(before.x ,before.y,-before.z)
                c.model.rotation.set(before.rx ,before.ry,before.rz)
                continue
            }

            c.model.position.x = before.x + frac * (after.x - before.x);
            c.model.position.y = Math.cos(frac*Math.PI/2 - Math.PI/4)/Math.sqrt(2)*0.8-0.4;
            c.model.position.z = -(before.z + frac * (after.z - before.z));

            c.testRotation.position.set(0,0,0)
            c.testRotation.rotation.set(before.rx, before.ry, before.rz)
            c.testRotation.rotateAroundWorldAxis(after.point, after.axis, after.angle*frac)
            c.model.rotation.set(c.testRotation.rotation.x, c.testRotation.rotation.y, c.testRotation.rotation.z)
        }
    }

    handleFrameData(frameInfo, data) {
        if (!data) return frameInfo;
        const cubes = this.cubes;
        const scene = this.scene;
        const base = assets.baseUrl || '';
        data.split(';').forEach(s => {
            const d = s.split(' ')
            const dieId = +d[1]
            if (d[0] == 'C') { // create
                const owner = +d[2]
                var die = { dieId, owner, states:[{t:0, x:0, y:0, z:0, rx:0, ry:0, rz:0}], testRotation:new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), null) }
                this.rollDie(die, d[5], 0)
                die.states = [{...die.states[die.states.length-1], t:0, x:0, y:0, z:0}]
                cubes.push(die)
                new FBXLoader().load( base + assets.images[['red.fbx', 'blue.fbx'][owner]],function ( fbx ) {
                    fbx.position.set(d[3]-3.5,0.5,3.5-d[4])
                    fbx.rotation.set(0,0,0)
                    fbx.children[0].rotation.set(die.states[0].rx, die.states[0].ry, die.states[0].rz)
                    fbx.children[0].position.set(0,0,0)
                    die.model = fbx.children[0]
                    scene.add(fbx)
                } );
            } else if (d[0] == 'M') { // move
                const die = cubes.filter(c => c.dieId == dieId)[0]
                this.rollDie(die, d[2], frameInfo.number - 1)
            } else if (d[0] == 'K') { // kill
                const die = cubes.filter(c => c.dieId == dieId)[0]
                die.states.push({...die.states[die.states.length-1], t:frameInfo.number, visible:false})
            }
        })

        return frameInfo;
    }

    handleGlobalData(players, globalData) {
        this.container = document.createElement('div');
        const viewer = document.body.children[0].children[1].children[0];
        const parent = viewer.parentElement
        parent.replaceChild(this.container, viewer);

        this.container.style.width = window.innerWidth;
        this.container.style.height = window.innerWidth * 9 / 16;

        this.camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
        this.renderer.setSize(window.innerWidth, window.innerWidth * 9 / 16);
        this.container.appendChild(this.renderer.domElement);

        const renderer = this.renderer;
        const scene = this.scene;
        const camera = this.camera;
        const animate = function() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        this.controls = new orbit.OrbitControls(camera, renderer.domElement);

        const base = assets.baseUrl || '';
        new FBXLoader().load(base + assets.images['board.fbx'],function ( fbx ) {
            fbx.scale.set(0.047, 0.047, 0.047)
            fbx.position.y = -0.393
            fbx.children[0].material.specular.r = 0.05
            fbx.children[0].material.specular.g = 0.05
            fbx.children[0].material.specular.b = 0.05
            scene.add(fbx)
        } );
        new FBXLoader().load(base + assets.images['Dining_table.fbx'],function ( fbx ) {
            fbx.scale.set(0.25, 0.25, 0.25)
            fbx.position.y = -0.1
            fbx.children[0].material.specular.r = 0.05
            fbx.children[0].material.specular.g = 0.05
            fbx.children[0].material.specular.b = 0.05
            scene.add(fbx)
        } );

        //camera.position.set(5, 10, 10);
        camera.position.set(0, 4.82, 4.11)
        camera.rotation.set(-1.09, 0, 0)
        this.controls.target.set(0, -0.82, 1.19)
        this.controls.update();

        const lights = [];
        lights[0] = new THREE.PointLight(0xffffff, 1, 0);
        lights[1] = new THREE.PointLight(0xffffff, 1, 0);
        lights[2] = new THREE.PointLight(0xffffff, 1, 0);
        lights[0].position.set(0, 200, 0);
        lights[1].position.set(100, 200, 100);
        lights[2].position.set(-100, -200, -100);

        const light = new THREE.AmbientLight( 0x404040 ); // soft white light
        scene.add( new THREE.AmbientLight( 0x404040 ) );
        scene.add(lights[0]);
        scene.add(lights[1]);
        scene.add(lights[2]);

        animate();
    }
}
