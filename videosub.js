(function(window) {
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
        var rect = video.getBoundingClientRect();
        var height = rect.bottom - rect.top;
        var width = rect.right - rect.left;
        
        var subrect = subcontainer.getBoundingClientRect();
        var subheight = subrect.bottom - subrect.top;
        
        subcontainer.style.width = width.toString() + 'px';
        
        subcontainer.style.left = rect.left.toString() + 'px';
        subcontainer.style.top = (rect.top + height - subheight).toString() + 'px';
        var fontsize = 12 + Math.ceil((width - 400) / 100)
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
            if (subtitle_src && subtitle_src.slice(subtitle_src.length - 3, subtitle_src.length) == 'srt') {
                process_video(videos[i]);
            }
        }
    }

    setTimeout(function(){ videosub_main(); }, 0);
})(window);

