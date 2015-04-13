/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
var RENDER_INTERVAL = 100;
var DEFAULT_GRAVITY = 5;
var WALL_BOUNCE_COOEFICIENT = 0.20;

var PROJECTILE_SVG = 'Character/Tank/Projectile/projectile.svg';

var CONFIG = window.top._tank_config;
if(typeof CONFIG === 'undefined') {
    var topDoc = window.top.document;
    CONFIG = window.top._tank_config = {
        documents: []
    };

    topDoc.addEventListener('render', onRender, false);
    topDoc.addEventListener('stats', onStats, true);
    topDoc.addEventListener('fire', onFire, true);
    topDoc.addEventListener('collision', onCollision, true);

    include('Character/Tank/tank.css', topDoc);
}
CONFIG.documents.push(document);

var testCache = [];
function isCollisionPoint(x, y) {
    if(x<0 || y<0 || x>document.offsetWidth || y>document.offsetHeight)
        return false;

    var i = x + y * document.offsetWidth;
    if(typeof testCache[i] === 'boolean')
        return testCache[i];

    var test = !!document.elementFromPoint(x, y);
    console.log("Test: ", [x, y, test]);
    testCache[i] = test;
    return test;
}


function isTankElement(element) {
    return element.classList && element.classList.contains('tank');
}
function isProjectileElement(element) {
    return element.classList && element.classList.contains('projectile');
}

function onCollision(e) {
    if(isTankElement(e.target)) {
        e.detail.isCollisionPoint = function(x, y) {
            return isCollisionPoint(x, y);
        };
    }
    if(isProjectileElement(e.detail.withElement)) {
        var projectile = e.detail.withElement;
        if(isTankElement(e.target)) {
            if(projectile.firedElement === e.target) {
                e.preventDefault();
            } else {
                e.detail.onCollisionPoint = function(x, y) {
                    detonateProjectile(projectile, e.target);
                };
            }
        } else {
            e.detail.onCollisionPoint = function(x, y) {
                detonateProjectile(projectile, e.target);
            };
        }
    }
}

function onFire(e) {
    if(!isTankElement(e.target))
        return;

//     explodeAt(e.target.parentNode, Math.random() * 500, Math.random() * 500, Math.random() * 200);

    fireCannon(e.target);
    //destroyTank(e.target);
}

function onRender(e) {
    var tanks = e.target.getElementsByClassName('tank');
    for(var i=0; i<tanks.length; i++)
        renderElement(tanks[i]);

    var projectiles = e.target.getElementsByClassName('projectile');
    for(i=0; i<projectiles.length; i++) {
        var velocity = getVelocity(projectiles[i]);
        var vectorAngle = (180 + 360 + Math.atan2(velocity.vy, velocity.vx) * 180 / Math.PI) % 360;
        setAngle(projectiles[i], vectorAngle);
        renderElement(projectiles[i]);
    }

    var explosions = e.target.getElementsByClassName('tank-explosion');
    for(i=0; i<explosions.length; i++)
        renderExplosion(explosions[i]);
}

function onStats(e) {
    if(!isTankElement(e.target))
        return;
//         e.detail.stats.tank = {
//             data: 'data'
//         }
}

function renderExplosion(element) {
    if(typeof element._frame === 'number') {
        element.classList.remove('f' + (element._frame));
        element._frame += 1; // Math.random() > 0.8;
    } else {
        element._frame = 1;
        element._vangle = Math.round(Math.random() * 5 - 2);
        for(var i=0; i<element.classList.length; i++) {
            var className = element.classList.item(i);
            var match = /f(-?[0-9]+)/.exec(className);
            if(!match)
                continue;
            element._frame = parseInt(match[1]);
            element.classList.remove(className);
        }
    }
    if(element._frame > 100) {
        element._frame = 1;
        //element.parentNode.removeChild(element);
        return;
    }
    element.classList.add('f' + (element._frame));


    if(!element.offsetWidth && !element.offsetHeight) {
        element.parentNode.removeChild(element);
        return;
    }

    setAngle(element, element._frame * element._vangle);
    var a = getAcceleration(element.parentNode);
    var p = getPosition(element);

    if(a.ax || a.ay) {
        p.x = (p.x || 0) + a.ax * RENDER_INTERVAL / 1000;
        p.y = (p.y || 0) - a.ay * RENDER_INTERVAL / 1000;
        setPosition(element, p.x, p.y);
    }
}

function fireCannon(element) {
    if(!isTankElement(element))
        throw new Error("Not a tank");

    var angle = getAngle(element) + 180;
    if(element.classList.contains('reversed'))
        angle += 180;

    var point = [element.offsetWidth / 2, element.offsetHeight / 2];
    var cannonTip = document.getElementById('cannon-tip');
    if(cannonTip) {
        var bb = cannonTip.getBoundingClientRect();
        point = [(bb.right + bb.left) / 2, (bb.bottom + bb.top) / 2];
        if(element.classList.contains('reversed'))
            point[0] = element.offsetWidth - point[0];
    }
    point = rotate(element.offsetWidth/2, element.offsetHeight/2, point[0], point[1], angle);
    point[0] += element.offsetLeft;
    point[1] += element.offsetTop;
    var projectile = window.top.document.createElement('div');
    projectile.classList.add('projectile');
    projectile.firedElement = element;
    element.parentNode.appendChild(projectile);
    //projectile.setAttribute('src', PROJECTILE_SVG);

    projectile.setAttribute('style', 'left: ' + (point[0] - projectile.offsetWidth/2) + 'px; top: ' +  (point[1] - projectile.offsetHeight/2) + 'px; transform: rotate(' + angle + 'deg);');

    var velocity = [-30,2];
    velocity = rotate(0, 0, velocity[0], velocity[1], angle);
    projectile.dataset.vx = velocity[0];
    projectile.dataset.vy = velocity[1];

    explodeAt(element.parentNode, point[0], point[1]);
    //setPosition(projectile, element.offsetLeft, element.offsetHeight);
//

}

function detonateProjectile(projectile, targetElement) {
    if(targetElement && isTankElement(targetElement)) {
        destroyTank(targetElement);
    }
    var x = projectile.offsetLeft + projectile.offsetWidth/2;
    var y = projectile.offsetTop + projectile.offsetHeight/2;
    explodeAt(projectile.parentElement, x, y, 96);
    projectile.parentElement.removeChild(projectile);
}

function destroyTank(element) {
    var svgDoc = CONFIG.documents[0];
    console.log(svgDoc.getElementsByTagName('path'));
}

var explodeContainer = null;
function explodeAt(container, x, y, size) {
    if(!size) size = 32;
    if(!explodeContainer)
        explodeContainer = container.getElementsByClassName('tank-explosion-container').item(0);
    if(!explodeContainer) {
        explodeContainer = container.ownerDocument.createElement('div');
        explodeContainer.classList.add('tank-explosion-container');
        container.appendChild(explodeContainer);
    }

    var explosion = container.ownerDocument.createElement('div');
    explosion.classList.add('tank-explosion');
    explodeContainer.appendChild(explosion);
    explosion.setAttribute('style', 'font-size: ' + size + 'px;');
    //explosion.style.left = x - explosion.offsetWidth/2;
    //explosion.style.top = y - explosion.offsetHeight/2;
    explosion.setAttribute('style', 'font-size: ' + size + 'px;left: ' + (x - explosion.offsetWidth/2) + 'px; top: ' + (y - explosion.offsetHeight/2) + 'px; ');

}