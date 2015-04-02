var current;
var errorCode;
var lat;
var lng;
var weatherXML;
var locale=chrome.i18n.getMessage("locale");
/*
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
document.getElementById('status').textContent = "123";
function error(msg)
{
    console.log(msg);
    chrome.browserAction.setBadgeText({text:"?"});
    errorCode="unable_to_locate_your_position";
}
*/
YahooWeatherGetter = new Object();
YahooWeatherGetter.showArea = undefined;

YahooWeatherGetter.showYahooWeather = function(lon, lat, div){
    YahooWeatherGetter.showArea = div;
    YahooWeatherGetter.callJsonp(YahooWeatherGetter.getUrlYahooPlaceFinder(lon, lat, YahooWeatherGetter.getYahooPlaceFinder));
}

YahooWeatherGetter.showError = function(){
    if(YahooWeatherGetter.showArea)
        YahooWeatherGetter.showArea.innerHTML = "無法取得天氣...";
}

YahooWeatherGetter.callJsonp = function(url){
    var script = document.createElement("script");
    script.src = url;
    document.body.appendChild(script);
}
function getYahooPlaceFinder(data){
    if(data){
        // data.query.results.Result.woeid
        // 28752317
        YahooWeatherGetter.callJsonp(
            YahooWeatherGetter.getUrlYahooWeatherForecast(data.query.results.Result.woeid, YahooWeatherGetter.getYahooWeatherForecast));
    }
}
YahooWeatherGetter.getYahooPlaceFinder = getYahooPlaceFinder;

function getYahooWeatherForecast(data){
    if(data){
        // data.query.results.Result.woeid
        // 28752317
        if(YahooWeatherGetter.showArea){
            var strHtml = "";
            strHtml += "<div style='float:left;'><img src='http://l.yimg.com/a/i/us/we/52/" + data.query.results.channel.item.condition.code + ".gif' /></div>";
            strHtml += "<div style='margin-left:60px;'><label>" + data.query.results.channel.location.city + "</label><br/>";
            strHtml += " " + data.query.results.channel.item.condition.temp + "℃ " + data.query.results.channel.item.condition.text + "</div>";
            
            // data.query.results.channel.location.city
            // data.query.results.channel.item.condition.code
            // http://l.yimg.com/a/i/us/we/52/28.gif
            YahooWeatherGetter.showArea.innerHTML = strHtml;
        }
    }
}
YahooWeatherGetter.getYahooWeatherForecast = getYahooWeatherForecast;

YahooWeatherGetter.getUrlYahooPlaceFinder = function(lon, lat, callback){
    var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.placefinder%20where%20text%3D%22"
    + lat + "%2C" + lon + "%22%20and%20gflags%3D%22R%22%20and%20lang%3D%22zh%22&format=json&diagnostics=true&callback=" + callback.name;
    return url;
}

YahooWeatherGetter.getUrlYahooWeatherForecast = function(woeid, callback){
    var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%3D"
    + woeid + "%20and%20u%3D%22c%22&format=json&diagnostics=true&callback=" + callback.name;
    return url;
}

YahooWeatherGetter.getCfromF = function(f){
    var c = (f - 32) * 5 / 9;
    return c;
}

YahooWeatherGetter.getFfromC = function(f){
    var f = c * 9 / 5 + 32;
    return f;
}
*/




function getWeather()
{
    
    $.get("http://weather.yahooapis.com/forecastrss?w=44418&u=c", function(data) {
        weatherXML=data;
        
        if(weatherXML.query.results.channel.location.city=="London")
        {
          
            errorCode="";
            current={};
            current.condition=weatherXML.query.results.channel.item.condition.text;
            current.condition=$(weatherXML).find("yweather:condition").attr("text");
            current.temp_c=$(weatherXML).find("yweather:condition").temp+"℃";
            current.temp_f="XX℉";
            current.humidity="";
            current.wind_condition="";
            console.log(current);
            document.getElementById('status').textContent = "12";

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
   getWeather(); 
}

function scheduleRequest() {
    var reqeustInterval = 1000 * 60 * 5;
    console.log("Scheduling request...");
    window.setTimeout(startRequest, reqeustInterval);
}



function renderPage()
{
    if(current)
    {
        //didnt access right now
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
        
        /*switch(errorCode){
            case "unable_to_locate_your_position":
                $("#current").html(chrome.i18n.getMessage("unable_to_locate_your_position"));
                break;
            
            case "unable_to_load_data":
                $("#current").html(chrome.i18n.getMessage("unable_to_load_data"));
                break;
            
            default:
                $("#current").html(chrome.i18n.getMessage("loading"));
        }*/
    }
}

document.addEventListener('DOMContentLoaded', function() {
 startRequest();
    scheduleRequest();
 renderPage();
});


