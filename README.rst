========================================
VideoSub: HTML5 Video with SRT Subtitles
========================================

Code
====

.. code:: HTML
    
    <script src="videosub.js"></script>

HTML
====

.. code:: HTML

    <video width="320" height="176" controls>
        <source src="jellies.mp4" type="video/mp4"/>
        <track src="jellies.srt" kind="subtitle" srclang="en-US" label="English"/>
    </video>

Fork Change Log
===============
This project is a fork from VideoSub_ v0.9.9. The following changes have
been made.

.. _VideoSub: https://github.com/thomassturm/VideoSub

* Multiline srt segments permitted
* Text position is lower and unclickable
