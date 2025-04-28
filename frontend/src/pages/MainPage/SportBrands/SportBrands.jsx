import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";
import "./SportBrands.css";

const SportBrands = () => {
  return (
    <div id="slider">
      <Swiper
        slidesPerView={3}
        spaceBetween={20}
        speed={3000}
        autoplay={{
          delay: 1,
          disableOnInteraction: true,
        }}
        loop={true}
        freeMode={true}
        modules={[Autoplay, FreeMode]}
        className="mySwiper"
      >
        <div className="div-slider">
          <SwiperSlide>
            <a
              href="https://www.nike.com/ru/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="images/swiper/nikelogo.svg"
                className="slider-el"
                alt="Nike"
              />
            </a>
          </SwiperSlide>
          <SwiperSlide>
            <a
              href="https://www.adidas.com/us"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="images/swiper/adidaslogo.svg"
                className="slider-el"
                alt="Adidas"
              />
            </a>
          </SwiperSlide>
          <SwiperSlide>
            <a
              href="https://about.puma.com/en"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="images/swiper/pumalogo.svg"
                className="slider-el"
                alt="Puma"
              />
            </a>
          </SwiperSlide>
          <SwiperSlide>
            <a
              href="https://www.newbalance.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="images/swiper/nblogo.svg"
                className="slider-el"
                alt="New Balance"
              />
            </a>
          </SwiperSlide>
          <SwiperSlide>
            <a
              href="https://www.reebok.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="images/swiper/reeboklogo.svg"
                className="slider-el"
                alt="Reebok"
              />
            </a>
          </SwiperSlide>
        </div>
      </Swiper>
    </div>
  );
};

export default SportBrands;
