import Axios from "axios";
import { useState, useEffect, useRef } from "react";
import moment from "moment/moment";

import "./App.css";

import { createWorker } from "tesseract.js";
import Tesseract from "tesseract.js";

function App() {
  /*
  const [food, setFood] = useState("");
  const [data, setData] = useState("");
  const [brand, setBrand] = useState("");
  const [calories, setCalories] = useState("");
  const [carbs, setCarbs] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");

  const [id, setId] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const fetchData = () => {
    Axios.get(
      "https://trackapi.nutritionix.com/v2/search/instant?query=" + food,
      {
        headers: {
          "x-app-id": "c9544acc",
          "x-app-key": "3ed4abd4158925bf3f2eaa881d069368",
        },
      }
    ).then((res) => {
      console.log(res.data.branded[0].nix_item_id);
      setId(res.data.branded[0].nix_item_id);
    });
  };

  const fetchNutrients = () => {
    Axios.get(
      "https://trackapi.nutritionix.com/v2/search/item?upc=5060639129287",
      {
        headers: {
          "x-app-id": "c9544acc",
          "x-app-key": "3ed4abd4158925bf3f2eaa881d069368",
        },
      }
    ).then((res) => {
      console.log(res.data);
      setCalories(res.data.foods[0].nf_calories);
      setCarbs(res.data.foods[0].nf_total_carbohydrate);
      setProtein(res.data.foods[0].nf_protein);
      setFat(res.data.foods[0].nf_total_fat);
      setImageUrl(res.data.foods[0].photo.thumb);
      setData(res.data.foods[0].food_name);
      setBrand(res.data.foods[0].brand_name);
    });
  };
  */

  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const [hasPhoto, setHasPhoto] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [expirationDate, setExpirationDate] = useState("");
  const [resultDay, setResultDay] = useState(0);
  const [resultMonth, setResultMonth] = useState(0);
  const [resultYear, setResultYear] = useState(0);

  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: { width: 1920, height: 1080 },
      })
      .then((stream) => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const takePhoto = async () => {
    const width = 300;
    const height = 300;

    let video = videoRef.current;
    let photo = photoRef.current;

    photo.width = width;
    photo.height = height;

    let ctx = photo.getContext("2d");
    await ctx.drawImage(video, 0, 0, width, height);

    let final = photo.toDataURL();

    //let processedImage = new Image();
    //processedImage.src = final;
    //console.log(final);
    await setSelectedImage(final);
    setHasPhoto(true);
    //runTesseract();
  };

  const takeAgain = () => {
    let photo = photoRef.current;

    let ctx = photo.getContext("2d");
    ctx.clearRect(0, 0, photo.width, photo.height);
    setHasPhoto(false);
  };

  useEffect(() => {
    getVideo();
  }, [videoRef]);

  const runTesseract = () => {
    (async () => {
      const worker = await createWorker({
        //langPath: "./tessdata",
        logger: (m) => console.log(m),
      });
      await worker.loadLanguage("eng");
      await worker.initialize("eng");
      /*
      await worker.setParameters({
        tessedit_char_whitelist: "0123456789./",
      });
      */
      const {
        data: { text },
      } = await worker.recognize(selectedImage);
      console.log(text);
      var res = text.match(/\d{2}([\/.-])\d{2}\1\d{4}/g);
      console.log(res);

      var newdate = "";
      if (res != null) {
        if (res[0].includes(".") == true) {
          newdate = res[0].toString().split(".");
          console.log("tečka");
          setResultDay(parseInt(newdate[0]));
          setResultMonth(parseInt(newdate[1]));
          setResultYear(parseInt(newdate[2]));
        } else if (res[0].includes("/") == true) {
          newdate = res[0].toString().split("/");
          console.log("carka");
          setResultDay(parseInt(newdate[0]));
          setResultMonth(parseInt(newdate[1]));
          setResultYear(parseInt(newdate[2]));
        } else {
          console.log("NIC PRVNI PODMINKA");
        }
      } else {
        setResultDay(null);
        console.log("NIC");
      }

      //var newdate = myString.toString().split(".");

      //setTextResult(text);

      await worker.terminate();
    })();
  };

  function changeDate(inputType, changeAction) {
    if (inputType == "days") {
      if (changeAction == "increase") {
        setResultDay(resultDay + 1);
      } else if (changeAction == "decrease") {
        setResultDay(resultDay - 1);
      }
    } else if (inputType == "months") {
      if (changeAction == "increase") {
        setResultMonth(resultMonth + 1);
      } else if (changeAction == "decrease") {
        setResultMonth(resultMonth - 1);
      }
    } else if (inputType == "years") {
      if (changeAction == "increase") {
        setResultYear(resultYear + 1);
      } else if (changeAction == "decrease") {
        setResultYear(resultYear - 1);
      }
    }
  }

  const saveExpirationDate = () => {
    setExpirationDate(
      resultDay.toString() +
        "." +
        resultMonth.toString() +
        "." +
        resultYear.toString()
    );
  };

  return (
    <div className="App">
      <div className="camera">
        <video ref={videoRef}></video>
        {hasPhoto == false && (
          <button className="scanButton" onClick={takePhoto}>
            <i
              className="fa-solid fa-camera fa-beat-fade fa-2xl"
              style={{ fontSize: 48 }}
            ></i>
          </button>
        )}
        {hasPhoto == true && (
          <button className="scanButton" onClick={takeAgain}>
            <i className="fa-solid fa-repeat fa-2xl"></i>
          </button>
        )}
        <canvas
          className={"photo " + (hasPhoto ? "hasPhoto" : "")}
          ref={photoRef}
        ></canvas>
      </div>
      <div className="input-wrapper">
        {hasPhoto == true && (
          <button className="scanButton" onClick={runTesseract}>
            <i
              className={
                "fa-solid fa-barcode fa-2xl " + (hasPhoto ? "fa-beat-fade" : "")
              }
            ></i>
          </button>
        )}
      </div>
      <div className="result">
        {resultDay != 0 && (
          <div className="dateAdjuster">
            <div className="dateValues">
              <button
                className="changeDateButton"
                onClick={() => changeDate("days", "decrease")}
              >
                <i className="fa-solid fa-minus fa-2xl"></i>
              </button>
              <input
                className="dateInput"
                type="number"
                min="01"
                max="31"
                step="1"
                value={resultDay}
                defaultValue={resultDay}
              ></input>
              <button
                className="changeDateButton"
                onClick={() => changeDate("days", "increase")}
              >
                <i className="fa-solid fa-plus fa-2xl"></i>
              </button>
            </div>
            <div className="dateValues">
              <button
                className="changeDateButton"
                onClick={() => changeDate("months", "decrease")}
              >
                <i className="fa-solid fa-minus fa-2xl"></i>
              </button>
              <input
                className="dateInput"
                type="number"
                min="01"
                max="31"
                step="1"
                value={resultMonth}
                defaultValue={resultMonth}
              ></input>
              <button
                className="changeDateButton"
                onClick={() => changeDate("months", "increase")}
              >
                <i className="fa-solid fa-plus fa-2xl"></i>
              </button>
            </div>
            <div className="dateValues">
              <button
                className="changeDateButton"
                onClick={() => changeDate("years", "decrease")}
              >
                <i className="fa-solid fa-minus fa-2xl"></i>
              </button>
              <input
                className="dateInput"
                type="number"
                min="01"
                max="31"
                step="1"
                value={resultYear}
                defaultValue={resultYear}
              ></input>
              <button
                className="changeDateButton"
                onClick={() => changeDate("years", "increase")}
              >
                <i className="fa-solid fa-plus fa-2xl"></i>
              </button>
            </div>
            <button className="saveButton" onClick={saveExpirationDate}>
              <i className="fa-solid fa-check fa-2xl"></i>
            </button>
          </div>
        )}
        {resultDay === null && <p>DATUM NENÍ VALIDNÍ</p>}
      </div>
      {expirationDate && (
        <p className="expirationDate">
          Expirační datum uloženo: {expirationDate}
        </p>
      )}
    </div>
  );
}

export default App;
