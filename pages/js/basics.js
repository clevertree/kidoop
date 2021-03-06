var doRender = function() {
    var renderEvent = new CustomEvent('render');
    document.dispatchEvent(renderEvent);
};
var renderInterval = setInterval(doRender, 30);

var pause = function() {
    clearInterval(renderInterval);
};
var resume = function() {
    clearInterval(renderInterval);
    renderInterval = setInterval(doRender, 30)
};

document.addEventListener('click', function(e) {
    var tanks = document.getElementsByClassName('usertank');
    for(var i=0; i<tanks.length; i++)
        tanks[i].dispatchEvent(new CustomEvent('fire', {
            detail: {
                clickEvent: e
            }
        }));
}, true);

document.addEventListener('xy', function(e) {
    var container = document.getElementsByClassName('artillery001')[0];
    container.dataset.ax = e.detail.percX * 20 - 10;
    container.dataset.ay = e.detail.percY * 20 - 10;
    e.detail.formatX = Math.round(container.dataset.ax*10)/10 + 'px/s';
    e.detail.formatY = Math.round(container.dataset.ay*10)/10 + 'px/s';
    e.detail.tankCount = document.getElementsByClassName('tank').length - 1;
});

document.addEventListener('touchmove', function(e) {
    e.preventDefault();
});



function onCompile() {
    for (var x = 0; x <= svgDoc.offsetWidth; x++) {
        var min = 0;
        var max = svgDoc.offsetHeight;
        while (max > min + 1) {
            var y = parseInt((min + max) / 2);
            if (!!elementFromPoint(x, y)) {
                max = y;
            } else {
                min = y;
            }
        }
        console.log(x, min,max);
    }
}