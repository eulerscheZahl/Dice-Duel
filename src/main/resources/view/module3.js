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
    pathMarkers = []
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();

    static get name() {
        return 'board'
    }

    reinitScene(container, canvasData) {}

    rollDie(die, direction, t, updateMarkers) {
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

            if (updateMarkers) {
                if (this.pathMarkers.length <= i) {
                    var marker = new THREE.Mesh(
                        new THREE.BoxGeometry(0.8,0.2,0.8),
                        new THREE.MeshPhongMaterial({
                            color:0x222222,
                            opacity:0.7,
                            flatShading: true,
                            transparent: true,
                        })
                    );
                    marker.states = [{t:-1, visible:false, x:0, y:0, z:0, color:0}]
                    this.scene.add(marker);
                    this.pathMarkers.push(marker)
                }
                var ms = { ...this.pathMarkers[i].states[this.pathMarkers[i].states.length-1], t:t+i/direction.length, x:s.x+die.offset[0], z:s.z+die.offset[2], color:[0xff0000, 0x0000ff][t%2], visible:true }
                this.pathMarkers[i].states.push(ms)
                this.pathMarkers[i].states.push( { ...ms, t:t+0.999, visible:false} )
           }
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
        for (var i = 0; i < this.pathMarkers.length; i++) {
            const m = this.pathMarkers[i];
            var idx = 0;
            while (m.states.length > idx + 1 && m.states[idx + 1].t < t) idx++;
            var state = m.states[idx];
            m.position.set(state.x, state.y, -state.z)
            m.visible = state.visible
            m.material.color.setHex(state.color)
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
                var die = { dieId, owner, states:[{t:0, x:0, y:0, z:0, rx:0, ry:0, rz:0}], testRotation:new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), null), offset:[d[3]-3.5,0,3.5-d[4]+[-7,7][owner]] }
                this.rollDie(die, d[5], 0, false)
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
                this.rollDie(die, d[2], frameInfo.number - 1, true)
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
        });
        new FBXLoader().load(base + assets.images['Dining_table.fbx'],function ( fbx ) {
            fbx.scale.set(0.25, 0.25, 0.25)
            fbx.position.y = -0.1
            fbx.children[0].material.specular.r = 0.05
            fbx.children[0].material.specular.g = 0.05
            fbx.children[0].material.specular.b = 0.05
            scene.add(fbx)
        });

        for (var playerId = 0; playerId < 2; playerId++) {
            var textureLoader = new THREE.TextureLoader();
            var crateTexture = textureLoader.load(players[playerId].avatar.textureCacheIds[1]);

            var imageCrate = new THREE.Mesh(
                new THREE.BoxGeometry(2,2,2),
                new THREE.MeshPhongMaterial({
                    color:0xffffff,
                    map:crateTexture,
                })
            );
            imageCrate.position.set(-6.5, 1, 3-5*playerId);
            scene.add(imageCrate);

            var nameCrate = new THREE.Mesh(
                new THREE.BoxGeometry(2,0.5,2),
                new THREE.MeshPhongMaterial({
                    color:0x222222,
                })
            );
            nameCrate.position.set(-6.5, -0.25, 3-5*playerId);
            scene.add(nameCrate);



            const loader = new THREE.FontLoader();
            const playerName = players[playerId].name
            const pId = playerId;
            const playerColor = players[playerId].color
            //loader.load( assets.images['optimer_bold.typeface.json.txt'], function ( response ) {
            loader.load('https://cdn-games.codingame.com/community/1500515-1615736605574/d74d88452c3a5afd3fb0e14149ba3bf5a094577f4574177a90a9fd0d9797f79e.txt', function(response) {
                const font = response;
                var textGeo = new THREE.TextGeometry( playerName, {
                    font: font,
                    size: 0.15,
                    height: 0.05,
                    curveSegments: 4,
                    bevelThickness: 0.02,
                    bevelSize: 0.015,
                    bevelEnabled: true
                });
                textGeo.computeBoundingBox();
                const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
                const materials = [
                    new THREE.MeshPhongMaterial( { color: playerColor, flatShading: true } ), // front
                    new THREE.MeshPhongMaterial( { color: playerColor } ) // side
                ];
                var textMesh = new THREE.Mesh( textGeo, materials );
                textMesh.position.set(centerOffset - 6.5, -0.2, 4-5*pId);
                scene.add(textMesh);
            });
        }

        scene.background = new THREE.CubeTextureLoader()
        	.load( [
        		'https://cdn-games.codingame.com/community/1500515-1615736605574/011f1a5e83599a186a7ca999ff449d77c94d334570b679c5a232241ae4dce625.png', //assets.images['rainbow_ft.png'],
        		'https://cdn-games.codingame.com/community/1500515-1615736605574/653bf76f5b51c4fae63ee8fe6ffb6be0c1228db990d15080bbb98d52a4e9c348.png', //assets.images['rainbow_bk.png'],
        		'https://cdn-games.codingame.com/community/1500515-1615736605574/88181270c9f73ea13ea7b0cc9a06443afd8a68498ab0f6de5aebf810d16acb8e.png', //assets.images['rainbow_up.png'],
        		'https://cdn-games.codingame.com/community/1500515-1615736605574/fd5c38f58d59e46ca40ee87139ee905c81007010b2b22a722cfce7ad433f6217.png', //assets.images['rainbow_dn.png'],
        		'https://cdn-games.codingame.com/community/1500515-1615736605574/6d7c0e3d256837b8c0b76c1844a495c98b629d5626a0e94a3f96368d0a1169fe.png', //assets.images['rainbow_rt.png'],
        		'https://cdn-games.codingame.com/community/1500515-1615736605574/77b816aaa288e60d4358bc649defaaba4637c2b46d665ae70ba2bd50370099a8.png', //assets.images['rainbow_lf.png'],
        	] );

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
