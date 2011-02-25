
/** 
 * Convert fractional degrees into degrees, minutes, and/or seconds.
 *
 * For example,
 *
 *     fractionalToDegrees(30.016944444444444)
 *     // = "30° 1′ 1″"
 * 
 **/
function fractionalToDegrees(fractional) {
    //hey = Math.floor(hh);
    var degrees = Math.floor(fractional);
    fractional -= degrees;
    fractional *= 60;
    var minutes = Math.floor(fractional);
    fractional -= minutes;
    fractional *= 60;
    var seconds = Math.round(fractional*100)/100;

    var text = "";
    if(degrees)
        text += degrees + "° ";
    if(minutes || (degrees && seconds))
        text += minutes + "′ ";
    if(seconds)
        text += seconds + "″ ";
    return text.substr(0, text.length-1); // There was an extra space at the end.
}

/**
 * Convert fractional kilometers into kilometers and fractional
 * meters.
 *
 * This behaviour is a bit different from fractionalToDegrees()
 * in that there is no accuracy to be spoken of. This is because
 * browsers will likely give multiples of ten if possible as output
 * in pos.coords.accuracy. Additionally, there is no other number
 * to compare it to.
 *
 * TODO: Revise above paragraph.
 *
 * NOTE: Remember that this function accept kilometers, unlike
 * pos.coords.accuracy, which is in meters.
 *
 **/
function fractionalToKilometers(fractional) {
    var kilometers = Math.floor(fractional);
    fractional -= kilometers;
    
    fractional *= 1000;
    var meters = fractional;
    
    var text = "";
    if(kilometers)
        text += kilometers + "&thinsp;km ";
    if(meters)
        text += meters + "&thinsp;m ";
    return text.substr(0, text.length-1);
}
