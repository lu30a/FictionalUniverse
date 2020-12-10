import * as THREE from "../build/three.module.js";
import { GLTFLoader } from "./jsm/loaders/GLTFLoader.js";

const mouse = new THREE.Vector2();
let container;
let camera;
let renderer;
let scene;
let txt1;
let rock;
let input;
let updateFcts = [];


function init() {
  //////////////////////////////
  // Container, Scene, Camera //
  //       Light, Renderer    //
  //////////////////////////////

  var rng = Math.seedrandom("You, p3rvert!");

  container = document.querySelector("#container");

  scene = new THREE.Scene();
  const fov = 45; // Field Of View
  const aspect = container.clientWidth / container.clientHeight;
  const near = 2;
  const far = 3000;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 800, -1000);

  const lightoo = new THREE.DirectionalLight(0xffffff, 1);
  lightoo.position.set(0, 1000, 0);
  lightoo.target.position.set(-500, 0, 0);
  scene.add(lightoo);
  scene.add(lightoo.target);

  var light = new THREE.AmbientLight(0xffffff); // soft white light
  scene.add(light);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.autoClear = false;
  renderer.setSize(container.clientWidth, container.clientHeight);
  //renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  /////////////
  // GROUND  //
  /////////////

  var heightMap = THREEx.Terrain.allocateHeightMap(256, 256);
  THREEx.Terrain.simplexHeightMap(heightMap);
  var groundGeo = THREEx.Terrain.heightMapToPlaneGeometry(heightMap);
  groundGeo.VertexColors;
  THREEx.Terrain.heightMapToVertexColor(heightMap, groundGeo);
  const loader = new THREE.TextureLoader();
  var groundMat = new THREE.MeshPhongMaterial({
    shading: THREE.SmoothShading,
    vertexColors: THREE.VertexColors,
  });
  var ground = new THREE.Mesh(groundGeo, groundMat);
  scene.add(ground);
  ground.rotateX(-Math.PI / 2);
  ground.scale.x = 3000;
  ground.scale.y = 3000;
  ground.scale.z = 200;

  ////////////////
  //    GRASS   //
  ////////////////
 
  const flload = new GLTFLoader();
  let xfl = 140;
  let zfl = 150;
  let yfl = THREEx.Terrain.planeToHeightMapCoords(
    heightMap,
    ground,
    xfl,
    zfl
  );
  flload.load("../src/flowers/scene.gltf", (gltf) => {
    let root = gltf.scene;
    root.scale.set(25, 25, 25);
    root.position.set(xfl, yfl , zfl);
    root.rotateY(Math.PI*1.3)
    scene.add(root);

    for (let i = 0; i < 15; i++) {
      let fl = root.clone();
      let xflo = (Math.random() - 0.5) * 10 + 103;
      let zflo = (Math.random() - 0.5) * 10 + 140;
      fl.position.set(
        xflo,
        THREEx.Terrain.planeToHeightMapCoords(heightMap, ground, xflo, zflo),
        zflo
      );
      fl.rotateY((Math.random() - 0.5) * 2 * Math.PI);
      scene.add(fl);
    }

  });

  ///////////
  // SKY  //
  //////////
  new THREE.CubeTextureLoader().setPath("../src/sky_box/").load(
    [
      "nebula_right1.png",
      "nebula_left2.png",
      "nebula_top3.png",
      "nebula_bottom4.png",
      "nebula_front5.png",
      "nebula_back6.png",
    ],
    // what to do when loading is over
    function (cubeTexture) {
      // CUBE TEXTURE is also an option for a background
      scene.background = cubeTexture;

      renderer.render(scene, camera);
    }
  );
  var sunAngle = (-1 / 6) * Math.PI * 2;
  var sunAngle = (-3 / 6) * Math.PI * 2;
  updateFcts.push(function (delta, now) {
    var dayDuration = 800; // nb seconds for a full day cycle
    sunAngle += (delta / dayDuration) * Math.PI * 2;
  });
  var sunSphere = new THREEx.DayNight.SunSphere();
  scene.add(sunSphere.object3d);
  updateFcts.push(function (delta, now) {
    sunSphere.update(sunAngle);
  });
  var sunLight = new THREEx.DayNight.SunLight();
  scene.add(sunLight.object3d);
  updateFcts.push(function (delta, now) {
    sunLight.update(sunAngle);
  });
  var skydom = new THREEx.DayNight.Skydom();
  scene.add(skydom.object3d);
  updateFcts.push(function (delta, now) {
    skydom.update(sunAngle);
  });

  ////////////////
  //    CUBES   //
  ////////////////
  let cube, xcube, zcube;
  let cubeMat = new THREE.MeshPhongMaterial({
    color: "rgba(11,11,11,1)",
  });
  for (let i = 0; i < 4; i++) {
    let cubeGeo = new THREE.BoxBufferGeometry(
      5 + 15 * Math.floor(Math.random() * 7),
      13 + 30 * Math.floor(Math.random() * 7),
      19 + 11 * Math.floor(Math.random() * 7)
    );
    cube = new THREE.Mesh(cubeGeo, cubeMat);
    xcube = Math.random() * 75 + 170;
    zcube = Math.random() * 75 + 300;
    cube.position.set(
      xcube,
      THREEx.Terrain.planeToHeightMapCoords(heightMap, ground, xcube, zcube),
      zcube
    );
    scene.add(cube);
  }
  ////////////////
  //    DRAGO   //
  ////////////////

  var textureDrago = new THREE.TextureLoader().load( 'src/drago.png' );
    
  var geometryDrago = new THREE.PlaneGeometry(100, 70);
  var materialDrago = new THREE.MeshBasicMaterial({map: textureDrago, side: THREE.DoubleSide});

  var drago = new THREE.Mesh(geometryDrago,materialDrago);
  drago.position.set(-35,THREEx.Terrain.planeToHeightMapCoords(heightMap,ground,-35,270)+50,270);
  drago.rotateY(Math.PI/1.3);
  scene.add(drago);


  ////////////////
  //    PALM   //
  ////////////////
  const gltfloader = new GLTFLoader();
  let xpalm = 10;
  let zpalm = -10;
  let ypalm = THREEx.Terrain.planeToHeightMapCoords(
    heightMap,
    ground,
    xpalm,
    zpalm
  );
  gltfloader.load("../src/palm/scene.gltf", (gltf) => {
    let root = gltf.scene;
    root.scale.set(20, 20, 20);
    root.position.set(xpalm, ypalm + 18, zpalm);
    scene.add(root);
    for (let i = 0; i < 15; i++) {
      let palm = root.clone();
      let xp = (Math.random() - 0.5) * 800+200;
      let zp = (Math.random() - 0.5) * 800+200;
      palm.position.set(
        xp,
        THREEx.Terrain.planeToHeightMapCoords(heightMap, ground, xp, zp) - 30,
        zp
      );
      palm.rotateY((Math.random() - 0.5) * 2 * Math.PI);
      scene.add(palm);
    }
  });

  function dumpObject(obj, lines = [], isLast = true, prefix = "") {
    const localPrefix = isLast ? "└─" : "├─";
    lines.push(
      `${prefix}${prefix ? localPrefix : ""}${obj.name || "*no-name*"} [${
        obj.type
      }]`
    );
    const newPrefix = prefix + (isLast ? "  " : "│ ");
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) => {
      const isLast = ndx === lastNdx;
      dumpObject(child, lines, isLast, newPrefix);
    });
    return lines;
  }


 ////////////
  //  ROCK  //
  ////////////


  const rload = new GLTFLoader();
  let xr = 180;
  let zr = 100;
  let yr = THREEx.Terrain.planeToHeightMapCoords(
    heightMap,
    ground,
    xr,
    zr
  );
  rload.load("../src/rock/scene.gltf", (gltf) => {
    rock = gltf.scene;
    rock.scale.set(17, 17, 17);
    rock.position.set(xr, yr , zr);
    rock.rotateY(Math.PI*1.3)
    scene.add(rock);
  });

  const txtloader1 = new THREE.FontLoader();
  txtloader1.load("../src/fonts/gothic.json", (font) => {
    let xtxt1 = 0;
    let ztxt1 = 300;
    let ytxt1 = THREEx.Terrain.planeToHeightMapCoords(
      heightMap,
      ground,
      xtxt1,
      ztxt1
    )+100;


    const text1 = "Name Me:";
    const geometryText1 = new THREE.TextBufferGeometry(text1, {
      font: font,
      size: 13,
      height: 1.3,
      curveSegments: 10,
      bevelEnabled: false,
    });
    var materialText1 = new THREE.MeshPhongMaterial({ color: new THREE.Color(0xf30ef7) });
    
    txt1 = new THREE.Mesh(geometryText1, materialText1);
    txt1.position.set(xtxt1, ytxt1, ztxt1);
    txt1.rotateY(Math.PI/1.3);
    scene.add(txt1);
  });

  window.namedragon = function namedragon(){

    scene.remove(txt1);
    let nomedrago=document.getElementById("name").value;
    const txtloader2 = new THREE.FontLoader();
  txtloader2.load("../src/fonts/gothic.json", (font) => {
    let xtxt2 = 0;
    let ztxt2 = 300;
    let ytxt2 = THREEx.Terrain.planeToHeightMapCoords(
      heightMap,
      ground,
      xtxt2,
      ztxt2
    )+100;

    const geometryText2 = new THREE.TextBufferGeometry(nomedrago, {
      font: font,
      size: 13,
      height: 1.3,
      curveSegments: 10,
      bevelEnabled: false,
    });
    var materialText2 = new THREE.MeshPhongMaterial({ color: new THREE.Color(0x09fc05) });
    
    let txt1 = new THREE.Mesh(geometryText2, materialText2);
    txt1.position.set(xtxt2, ytxt2, ztxt2);
    txt1.rotateY(Math.PI/1.3);
    scene.add(txt1);
    
  });
  document.getElementById("block").style.visibility = "hidden";
  }

  var domEvents	= new THREEx.DomEvents(camera, renderer.domElement)
  domEvents.addEventListener(drago, 'click', function(event){

    document.getElementById("block").style.visibility = "visible";

  }, false)




  ////////////
  //  TEXT  //
  ////////////
  let txt;
  const txtloader = new THREE.FontLoader();
  txtloader.load("../src/fonts/gentilis_regular.typeface.json", (font) => {
    let xtxt = -50;
    let ztxt = 250;
    let ytxt = THREEx.Terrain.planeToHeightMapCoords(
      heightMap,
      ground,
      xtxt,
      ztxt
    );
    const text = "Welcome";
    const geometryText = new THREE.TextBufferGeometry(text, {
      font: font,
      size: 27.0,
      height: 2.5,
      curveSegments: 10,
      bevelEnabled: false,
    });
    var materialText = new THREE.MeshNormalMaterial({ wireframe: false });
    txt = new THREE.Mesh(geometryText, materialText);
    txt.position.set(xtxt, ytxt + 20, ztxt);
    txt.rotateY(Math.PI/1.6);
    scene.add(txt);
  });

  /////////////
  //  PLANE  //
  /////////////


  //////////////////////////////
  //		camera 'object'				//
  //////////////////////////////
  let sphereGeo = new THREE.SphereBufferGeometry(10, 10, 10);
  let sphereMat = new THREE.MeshNormalMaterial({
    wireframe: true,
  });
  var player = new THREE.Mesh(sphereGeo, sphereMat);
  var controls = new THREEx.MinecraftControls(player);
  player.controls = controls;
  updateFcts.push(function (delta, now) {
    controls.update(delta, now);
  });
  scene.add(player);
  updateFcts.push(function (delta, now) {
    var position = player.position;
    position.y = THREEx.Terrain.planeToHeightMapCoords(
      heightMap,
      ground,
      position.x,
      position.z
    );
  });
  // attach camera to player
  input = player.controls.input;
  player.add(camera);
  player.add(skydom.object3d);
  camera.position.z = -20;
  camera.position.y = 60;
  camera.lookAt(new THREE.Vector3(0, 55, 7));

  var joy = new JoyStick("joyDiv");
  //////////////////////////////////////////////////////////////////////////////////
  //		render the scene						//
  //////////////////////////////////////////////////////////////////////////////////

  // render the webgl
  updateFcts.push(function () {
    renderer.render( scene, camera );
  });

  //////////////////////////////////////////////////////////////////////////////////
  //		loop runner							//
  //////////////////////////////////////////////////////////////////////////////////
  var lastTimeMsec = null;
  requestAnimationFrame(function animate(nowMsec) {
    // keep looping
    if (joy.GetDir() == "N") {
      input.up = true;
      input.down = false;
      input.left = false;
      input.right = false;
    }
    if (joy.GetDir() == "S") {
      input.down = true;
      input.up = false;
      input.left = false;
      input.right = false;
    }
    if (joy.GetDir() == "E") {
      input.right = true;
      input.up = false;
      input.down = false;
      input.left = false;
    }
    if (joy.GetDir() == "W") {
      input.left = true;
      input.up = false;
      input.down = false;
      input.right = false;
    }
    if (joy.GetDir() == "C") {
      input.up = false;
      input.down = false;
      input.left = false;
      input.right = false;
    }
    requestAnimationFrame(animate);
    // measure time
    lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
    lastTimeMsec = nowMsec;
    // call each update function


    updateFcts.forEach(function (updateFn) {
      updateFn(deltaMsec / 1000, nowMsec / 1000);
    });
  });
}

init();
