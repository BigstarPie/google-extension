var current;
var errorCode;

var lat;
var lng;
var weatherXML;
var locale=chrome.i18n.getMessage("locale");

function getCurrentLocation()
{
    console.log("getCurrentLocation()");
    navigator.geolocation.getCurrentPosition(success, error);
}

function success(position)
{
    console.log(position);
    lat=Math.round(position.coords.latitude*1000000);
    lng=Math.round(position.coords.longitude*1000000);
    getWeather();
}

function error(msg)
{
    console.log(msg);
    chrome.browserAction.setBadgeText({text:"?"});
    errorCode="unable_to_locate_your_position";
}

function getWeather()
{
    console.log("http://www.google.com/ig/api?hl="+locale+"&weather=,,,"+lat+","+lng);
   
    $.get("http://www.google.com/ig/api?hl="+locale+"&weather=,,,"+lat+","+lng, function(data) {
        weatherXML=data;
        
        if($(weatherXML).find("weather current_conditions").length==1)
        {
            errorCode="";
            current={};
            current.condition=$(weatherXML).find("current_conditions condition").attr("data");
            current.temp_c=$(weatherXML).find("current_conditions temp_c").attr("data")+"℃";
            current.temp_f=$(weatherXML).find("current_conditions temp_f").attr("data")+"℉";
            current.humidity=$(weatherXML).find("current_conditions humidity").attr("data");
            current.wind_condition=$(weatherXML).find("current_conditions wind_condition").attr("data");
            current.icon="http://img0.gmodules.com"+$(weatherXML).find("current_conditions icon").attr("data");
            console.log(current);
            
            var temp_mode=localStorage["temperature_mode"];
            if(!temp_mode)
            {
                temp_mode="C";
            }

            switch(temp_mode){
            case "C":
                chrome.browserAction.setBadgeText({text:current.temp_c});
                break;

            case "F":
                chrome.browserAction.setBadgeText({text:current.temp_f});
                break;
            }
            chrome.browserAction.setIcon({path:current.icon});
        }
        else
        {
            chrome.browserAction.setBadgeText({text:"?"});
            errorCode="unable_to_load_data";
        }
    });
}

function startRequest()
{
   getCurrentLocation(); 
}

function scheduleRequest() {
    var reqeustInterval = 1000 * 60 * 5;
    console.log("Scheduling request...");
    window.setTimeout(startRequest, reqeustInterval);
}
startRequest();
scheduleRequest();

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

function renderPage()
{
    current=chrome.extension.getBackgroundPage().current;
    errorCode=chrome.extension.getBackgroundPage().errorCode;
    if(current)
    {
        var temp_mode=localStorage["temperature_mode"];
        if(!temp_mode)
        {
            temp_mode="C";
        }

        switch(temp_mode){
            case "C":
                $("#temp").html('<img src='+current.icon+'>'+current.temp_c);
                break;

            case "F":
                $("#temp").html('<img src='+current.icon+'>'+current.temp_f);
                break;
        }
        $("#detail").html(current.condition+'<br>'+current.humidity+'<br>'+current.wind_condition);
    }
    else
    {
        switch(errorCode){
            case "unable_to_locate_your_position":
                $("#current").html(chrome.i18n.getMessage("unable_to_locate_your_position"));
                break;
            
            case "unable_to_load_data":
                $("#current").html(chrome.i18n.getMessage("unable_to_load_data"));
                break;
            
            default:
                $("#current").html(chrome.i18n.getMessage("loading"));
        }
    }
}



document.addEventListener('DOMContentLoaded', renderPage());
