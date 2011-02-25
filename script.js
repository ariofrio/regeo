(function() {
    
    //$ = function(id) { return document.getElementById(id); };
    
    // We assume we have a modern browser.
    // TODO: Implement fallbacks.
    //$U = function(s) { return document.querySelector(s); };
    //$$ = function(s) { return document.querySelectorAll(s); };

    // TODO: Try to get navigator.geolocation to work with Gears.
    
    // Global object.
    window.ReGeo = new Object;
    
    ReGeo.handlePosition = function(pos) {
        var degreeAccuracy;
        var latitudeMagnitude, latitudeText, latitudeHTML;
        var longitudeMagnitude, longitudeText, longitudeHTML;
        var accuracyEuclidean, accuracyAngular, accuracyHTML;
        
        try {
            degreeAccuracy = pos.coords.accuracy / 111034;
            
            latitudeMagnitude = fractionalToDegrees(
                Math.abs(pos.coords.latitude), degreeAccuracy);
            
            latitudeText = pos.coords.latitude > 0 ?
                latitudeMagnitude + ' N' :
                latitudeMagnitude + ' S';
            latitudeHTML = pos.coords.latitude > 0 ?
                latitudeMagnitude + ' <abbr title="North of the Equator">N</abbr>' :
                latitudeMagnitude + ' <abbr title="South of the Equator">S</abbr>';
            
            longitudeMagnitude = fractionalToDegrees(
                Math.abs(pos.coords.longitude), degreeAccuracy);
            longitudeText = pos.coords.longitude > 0 ?
                longitudeMagnitude + ' E' :
                longitudeMagnitude + ' W';
            longitudeHTML = pos.coords.longitude > 0 ?
                longitudeMagnitude + ' <abbr title="East of the Greenwich Meridian">E</abbr>' :
                longitudeMagnitude + ' <abbr title="West of the Greenwich Meridian">W</abbr>';
            
            accuracyEuclidean = fractionalToKilometers(
                pos.coords.accuracy/1000) // TODO: Is the name correct?
            accuracyAngular = fractionalToDegrees(
                degreeAccuracy, degreeAccuracy); // TODO: I still don't know why this works.
            accuracyHTML = "<small>(accurate to " +
                accuracyEuclidean + " or " + accuracyAngular
                + ")";
            if(pos.coords.accuracy < 100)
                accuracyHTML += '<br><a href="http://maps.google.com/maps?q='+ latitudeText + ' ' + longitudeText +'">Scary good, huh?</a>';
            accuracyHTML += "</small>";
            
            while(ReGeo.notifications.firstElementChild) {
                ReGeo.notifications.removeChild(ReGeo.notifications.firstElementChild);
            }
            
            $("latitude").innerHTML = latitudeHTML;
            $("longitude").innerHTML = longitudeHTML;
            $("accuracy").innerHTML = accuracyHTML;
        } catch(e) {
            ReGeo.handleError(e);
        }
    }
    
    ReGeo.handleError = function(err) {
        while(ReGeo.notifications.firstElementChild) {
            ReGeo.notifications.removeChild(ReGeo.notifications.firstElementChild);
        }
        if(!err.code) { // For example, when called from handlePosition().
            // err is actually an Exception
            //alert(err);
            console && console.error && console.error(err);
            
            var error = document.createElement("li");
            error.className = "internal error";
            error.innerHTML = '<p><strong>Error!</strong> It’s a bug in my code! Please <a href="mailto:riofrios@gmail.com">send me a line</a> telling me what you were doing when this message appeared.</p><p><small>(For the technically inclined, the error should appear in your Javascript console.)</small></p>';
            error.innerHTML += '<p><small>Error: ' + err.toString() + '</small></p>'
            ReGeo.notifications.appendChild(error);
        } else {
            //alert(err);
            console && console.warn && console.warn("ReGeo.handleError:", err);
            
            switch(err.code) {
            case err.PERMISSION_DENIED:
                var error = document.createElement("li");
                error.className = "permission_denied error";
                error.innerHTML = '<p>Hey! You’re going to have to allow me to know your location if you want my help.</p><p><strong>Please <a href="." class="button">reload the page</a> and allow sharing location.</strong></p>';
                ReGeo.notifications.appendChild(error);
                break;
            case err.TIMEOUT:
                var error = document.createElement("li");
                error.className = "timeout error";
                error.innerHTML = '<p>Eh, your device is taking too long to find your position.</p><p><strong>You can <a href="." class="button">try again</a> if you’d like.</strong></p>';
                ReGeo.notifications.appendChild(error);
                break;
            case err.POSITION_UNAVAILABLE:
            default:
                var error = document.createElement("li");
                error.className = "position_unavailable error";
                error.innerHTML = '<p>Argh! Something bad happened. Can’t get your position.</p><p><strong>You can  <a href="." class="button">try again</a> if you’d like. Weird...</strong></p>';
                ReGeo.notifications.appendChild(error);
                break;
            }
        }
    }
    
    // Again, we are assuming we have a modern browser.
    document.observe("dom:loaded", function(ev) {
        ReGeo.notifications = $("notifications");
    
        if(navigator.geolocation) {
            // Remove the HTML-included message about requiring a
            // supported browser.
            ReGeo.notifications.removeChild(ReGeo.notifications.firstElementChild);
            
            // Add a Loading message.
            var loading = document.createElement("li");
            loading.className = "loading";
            loading.textContent = "Loading your position...";
            ReGeo.notifications.appendChild(loading);
            
            if(!navigator.geolocation.watchPosition) {
                while(ReGeo.notifications.firstElementChild) {
                    ReGeo.notifications.removeChild(ReGeo.notifications.firstElementChild);
                }
                
                // Incomplete implementation! How sad.
                // TODO: Work around this.
                var error = document.createElement("li");
                error.className = "incomplete_implementation error";
                error.textContent = "I’m sorry. Not only do we require your browser to suport the Geolocation API, we also require it to support it completely. Get a better browser! Boo-hoo!";
                ReGeo.notifications.appendChild(error);
            } else {
                ReGeo.watchid = navigator.geolocation.watchPosition(
                    ReGeo.handlePosition,
                    ReGeo.handleError,
                    {
                        maximumAge: 10*60*1000, 
                        timeout: 10*1000,
                        enableHighAccuracy: false,
                    }
                );
                // TODO: Allow user to customize maximumAge (milliseconds, or Infinity), timeout (milliseconds, or Infinity), and enableHighAccuracy (bool).
                // FIXME: Firefox 3.6 sometimes doesn't timeout and Loads forever. TODO: Confirm.
            }
        }
        
        // Just cuz' it's pretty.
        
        if(iPhoneStyle) {
            new iPhoneStyle('#controls input[type=checkbox]#enableHighAccuracy', {
                statusChange: function(elem) {
                    navigator.geolocation.clearWatch(ReGeo.watchid);
                    ReGeo.watchid = navigator.geolocation.watchPosition(
                        ReGeo.handlePosition,
                        ReGeo.handleError,
                        {
                            maximumAge: 10*60*1000, 
                            timeout: 10*1000,
                            enableHighAccuracy: elem.checked,
                        }
                    );
                }
            });
        }
    });
    
})();
