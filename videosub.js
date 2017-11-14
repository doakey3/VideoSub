(function(window) {
    function get_pos(element) {
        var x = 0;
        var y = 0;
        while (element != null) {
            x += element.offsetLeft;
            y += element.offsetTop;
            element = element.offsetParent;
        }
        return [x, y];
    }

    function tc2secs(tc) {
        //Convert a srt timecode '00:00:00,000' to seconds
        var hours = parseFloat(tc.split(':')[0]) * 3600;
        var mins = parseFloat(tc.split(':')[1]) * 60;
        var secs = parseFloat(tc.split(':')[2]);
        var millis = parseFloat(tc.split(',')[1]) / 1000;
        secs = hours + mins + secs + millis
		return secs;
	}
    
    function process_subtitle(text) {
        var raw_segs = text.split('\n\n');
        var segments = [];
        for (var i = 0; i < raw_segs.length; i++) {
            var lines = raw_segs[i].split('\n');
            var timecode_line = lines[1];
            var start = tc2secs(timecode_line.split(' --> ')[0]);
            var end = tc2secs(timecode_line.split(' --> ')[1]);
            var content = lines.slice(2, lines.length);
            segments.push([start, end, content]);
        }
        return segments;
    }
    
    function position_subtitle(video, subcontainer) {
        var video_x = get_pos(video)[0];
        var video_y = get_pos(video)[1];
        
        subcontainer.style.width = video.offsetWidth.toString() + 'px';
        
        subcontainer.style.left = video_x.toString() + 'px';
        subcontainer.style.top = (video_y + video.offsetHeight - subcontainer.offsetHeight).toString() + 'px';
        var fontsize = 12 + Math.ceil((video.offsetWidth - 400) / 100)
        subcontainer.style.fontSize = fontsize.toString() + 'px';
    }
    
    function process_video(video) {
        var subtitle_src = video.querySelector('track').src;
        var request = new XMLHttpRequest();
        request.open('GET', subtitle_src, true);
        request.overrideMimeType('text/plain');
        request.onload = function() {
            if (request.status == 200) {
                var text = request.responseText;
                var segments = process_subtitle(text);
                
                var subcontainer = document.createElement("div");
                
                subcontainer.style.position = 'absolute';
                subcontainer.style.textAlign = 'center';
                subcontainer.style.paddingTop = '5px';
                subcontainer.style.paddingBottom = '5px';
                subcontainer.style.color = '#FFFFFF';
                subcontainer.style.fontFamily = 'Helvetica, Arial, sans-serif';
                subcontainer.style.fontWeight = 'bold';
                subcontainer.style.textShadow = '1px 1px #000000';
                subcontainer.style.pointerEvents = 'none';

                document.documentElement.appendChild(subcontainer);
                position_subtitle(video, subcontainer);
                
                video.addEventListener('timeupdate', function(event) {
                    sub = '';
                    for (var s = 0; s < segments.length; s++) {
                        if (this.currentTime > segments[s][0] && this.currentTime < segments[s][1]) {
                            sub = segments[s][2].join('<br>');
                            break
                        }
                    }
                    subcontainer.innerHTML = sub;
                    position_subtitle(video, subcontainer);
                });
            }
        }
        request.send();
    }

    function videosub_main() {
        var videos = document.getElementsByTagName('video');
        for (var i = 0; i < videos.length; i++) {
            var subtitle_src = videos[0].querySelector('track').src;
            if (subtitle_src) {
                process_video(videos[i]);
            }
        }
    }

    setTimeout(function(){ videosub_main(); }, 0);
})(window);

