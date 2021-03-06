
var dragging = false;
function onClick(e) {
    var w = document.documentElement.offsetWidth || document.documentElement.width.baseVal.value;
    var h = document.documentElement.offsetHeight || document.documentElement.height.baseVal.value;
    var x = e.pageX || e.clientX + document.documentElement.scrollLeft + document.documentElement.scrollLeft;
    var y = e.pageY || e.clientY + document.documentElement.scrollTop + document.documentElement.scrollTop;

    x-=50;
    y-=50;
    w-=100;
    h-=100;

    if(x<0) x=0;
    if(y<0) y=0;
    if(x>w) x=w;
    if(y>h) y=h;


    switch(e.type) {
        default:
        case 'click':
            dragging = false;
            break;
        case 'mousedown':
        case 'touchstart':
            dragging = true;
            break;
        case 'mouseup':
        case 'touchend':
            dragging = false;
            break;
        case 'mousemove':
        case 'touchmove':
            if(!dragging)
                return;
            break;
    }

    var angle = parseInt(Math.atan2(x - w/2, h/2 - y) * 180 / Math.PI);
    if(angle<18) angle = 18;
    if(angle>90) angle = 90;

    var angleRotate = document.getElementsByClassName('angle-rotate');
    for(var i=0; i<angleRotate.length; i++)
        angleRotate[i].setAttribute('transform', 'rotate(' + (angle - 90) + ')');

    document.getElementById('angle-circle').style.strokeDashoffset = -angle;

    var event = new CustomEvent('xy', {
        detail: {
            x: x,
            y: y,
            totalX: w,
            totalY: h,
            percX: x / w,
            percY: y / h,
            formatX: null,
            formatY: null,
            tankCount: null
        }
    });

    document.dispatchEvent(event);
    window.top.document.dispatchEvent(event);

    if(event.detail.formatX !== null)
        document.getElementById('text-ax-value').innerHTML = event.detail.formatX;
    if(event.detail.formatY !== null)
        document.getElementById('text-ay-value').innerHTML = event.detail.formatY;
    if(event.detail.tankCount !== null)
        document.getElementById('text-tank-count').innerHTML = event.detail.tankCount;
}
document.addEventListener('click', onClick);

document.addEventListener('mousedown', onClick);
document.addEventListener('mousemove', onClick);
document.addEventListener('mouseup', onClick);
document.addEventListener("touchstart", onClick, true);
document.addEventListener("touchmove", onClick, true);
document.addEventListener("touchend", onClick, true);
