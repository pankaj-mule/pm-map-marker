MarketPlaces = [];
isMapsLoaded = false;

var slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("mySlides");
    if (slides.length === 0)
        return;

    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slides[slideIndex - 1].style.display = "block";
}

const getInfoWindow = (data) => {
    return (`
        <div id="content">
            <div id="siteNotice"></div>
            <h2 id="firstHeading" class="firstHeading">${data.title}</h2>
            <div id="bodyContent">
                <p><b>${data.address}</b></p>
                <div class="slideshow-container"> 
                    ${data.images.map((url, index) => (
        `<div class="mySlides fade" ${index === 0 ? 'style="display:block"' : ''}>
         <div class="numbertext">${index + 1} / ${data.images.length}</div>
         <img src="${url}" style="width:100%">
      </div>`
    ))}
                    <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
                    <a class="next" onclick="plusSlides(1)">&#10095;</a>
                </div>
            </div>
        </div>
        `);
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
            zoom: 10,
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
        let images = [];
        Object.keys(others).forEach(key => {
            if (key.toLowerCase().startsWith('imageurl'))
                images.push(others[key]);
        });
        const infowindow = new google.maps.InfoWindow({
            content: getInfoWindow({ title: Store_Name, address: Address, images, ...others }),
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
            slideIndex = 1;
            showSlides(slideIndex);
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