import audioChime from '../audio/breaking-news-5.ogg';
import nuclearLaunch from '../audio/Nuclear_Launch.ogg'
import goodNews from '../audio/good-news.ogg'
// Audio trigger code...
function playTrack(type) {
    let audio = null
    
    if (type === 'nuclear') audio = new Audio(nuclearLaunch);
    if (type === 'login') audio = new Audio(goodNews);   
    if (type === 'bootup') audio = new Audio(audioChime);

    audio.type = 'audio/ogg';
    audio.loop = false;
    audio.play();
}

export default playTrack;