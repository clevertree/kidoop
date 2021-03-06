/**
 * Created with JetBrains PhpStorm.
 * User: Ari
 */
(function(){
    // Include

    var include = function(src) {
        if(/\.js$/i.test(src)) {
            var scripts = document.head.getElementsByTagName('script');
            for(var si=0; si<scripts.length; si++)
                if(scripts[si].getAttribute('src') == src)
                    return false;

            var script = document.createElement('script');
            script.setAttribute('src', src);
            document.head.appendChild(script);
            return true;

        } else if (/\.css$/i.test(src)) {
            var links = document.head.getElementsByTagName('link');
            for(var li=0; li<links.length; li++)
                if(links[li].getAttribute('href') == src)
                    return false;

            var link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('href', src);
            document.head.appendChild(link);
            return true;
        } else {
            throw new Error("Invalid SRC: " + src);
        }
    };

    include('Traits/Draggable/assets/draggable.js');
    include('Traits/Draggable/assets/draggable.css');

    include('Objects/Circle/assets/circle.js');
    include('Objects/Circle/assets/circle.css');

    include('Traits/Stats/assets/stats.js');
    include('Traits/Stats/assets/stats.css');

    // Methods

    var isMarball = function(element) {
        return element.classList.contains('marball') || /^marball$/i.test(element.nodeName);
    };

    var marballs = null;
    var initMarball = function(e) {
        if(marballs === null)
            marballs = document.getElementsByTagName('marball');
        for(var i=0; i<marballs.length; i++) {
            var marball = marballs[i];
            if(!marball.style.left)
                marball.style.left = marball.offsetLeft + 'px';
            if(!marball.style.top)
                marball.style.top = marball.offsetTop + 'px';
        }

        // Add marball class after position init
        for(i=0; i<marballs.length; i++) {
            marball = marballs[i];
            if(!marball.classList.contains('circle'))
                marball.classList.add('circle');
            if(!marball.classList.contains('stats'))
                marball.classList.add('stats');
        }
    };
    document.addEventListener('init', initMarball);
    setTimeout(initMarball, 1000);


    var statsElement = function (e, marball) {
        marball = marball || e.target || this;
        if(!isMarball(marball))
            return;
//         e.detail.stats.marball = {
//             data: 'data'
//         }
    };

    document.addEventListener('stats', statsElement, true);

})();