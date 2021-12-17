MarketPlaces = [];
isMapsLoaded = false;

const getInfoWindow = (data) => {
    return (
        '<div id="content">' +
        '<div id="siteNotice">' +
        "</div>" +
        '<h1 id="firstHeading" class="firstHeading">' + data.title + '</h1>' +
        '<div id="bodyContent">' +
        "<p><b>" + data.title + "</b>, also referred to as <b>Ayers Rock</b>, is a large " +
        "sandstone rock formation in the southern part of the " +
        data.address + ". It lies 335&#160;km (208&#160;mi) " +
        "south west of the nearest large town, Alice Springs; 450&#160;km " +
        "(280&#160;mi) by road. Kata Tjuta and Uluru are the two major " +
        "features of the Uluru - Kata Tjuta National Park. Uluru is " +
        "sacred to the Pitjantjatjara and Yankunytjatjara,</p>" +
        '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">' +
        "https://en.wikipedia.org/w/index.php?title=Uluru</a> " +
        "(last visited June 22, 2009).</p>" +
        "</div>" +
        "</div>");
};

const loadLocations = (e) => {
    var request = new XMLHttpRequest();
    request.open("GET", "locations.csv", true);
    request.setRequestHeader('Access-Control-Allow-Origin', '*');
    request.onreadystatechange = function () {
        if (request?.status === 200 && request.responseText) {
            let response = request.responseText;
            processData(response);
        }
    };
    request.send(null);
};

const processData = (response) => {
    let locationsRecords = response.split(/\r\n|\n/),
        headers = locationsRecords[0].split(','),
        locations = [];

    for (let i = 1; i < locationsRecords.length; i++) {
        let rowData = locationsRecords[i].split(',');
        if (rowData.length == headers.length) {
            let record = {};
            headers.forEach((column, index) => {
                record[column] = rowData[index];
            });
            locations.push(record);
        }
    }
    MarketPlaces = locations;
    if (locations.length && isMapsLoaded)
        addMarkersToMap(locations);
};

const addMarkersToMap = (locations) => {
    const map = new google.maps.Map(
        document.getElementById("map"),
        {
            zoom: 14,
            center: { lat: Number.parseFloat(locations[0].Lat), lng: Number.parseFloat(locations[0].Long) },
        }
    );

    const getIcon = (type) => {
        const color = (type == 'C') ? 'FFFF00' : 'FF0000';
        if (!type) type = '•'; //generic map dot
        return "http://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=" + type + "|" + color;
    };

    locations.forEach(location => {
        const { Lat, Long, Types, Address, Store_Name, ...others } = location;
        const infowindow = new google.maps.InfoWindow({
            content: getInfoWindow({ title: Store_Name, address: Address, ...others }),
        });

        const marker = new google.maps.Marker({
            map,
            title: Store_Name,
            icon: getIcon(Types),
            animation: google.maps.Animation.DROP,
            position: { lat: Number.parseFloat(Lat), lng: Number.parseFloat(Long) },
        });
        marker.addListener("click", () => {
            infowindow.open({
                anchor: marker,
                map,
                shouldFocus: false,
            });
        });
    });
}

var loadMap = () => {
    isMapsLoaded = true;
    if (MarketPlaces?.length) {
        addMarkersToMap(MarketPlaces);
    }
    else {
        const myLatLng = { lat: 19.0745, lng: 72.9978 };
        const map = new google.maps.Map(
            document.getElementById("map"),
            {
                zoom: 12,
                center: myLatLng,
            }
        );
    }
};

loadLocations();