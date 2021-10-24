import style from "@/styles/calendar.module.scss";
import moment from "moment";
import React, {
  InputHTMLAttributes,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";

moment.locale("Ja");
const weekdays = [
  { ja_week: "月", en_week: "Mon" },
  { ja_week: "火", en_week: "Tu" },
  { ja_week: "水", en_week: "Wed" },
  { ja_week: "木", en_week: "Th" },
  { ja_week: "金", en_week: "Fri" },
  { ja_week: "土", en_week: "Sat" },
  { ja_week: "日", en_week: "Sun" },
];
interface rangeProps {
  m: moment.Moment;
  mf: string;
}

const sliceByNumber = (array: rangeProps[], number: number) => {
  const length = Math.ceil(array.length / number);

  return new Array(length)
    .fill(array)
    .map((_, i) => array.slice(i * number, (i + 1) * number));
};

const CalendarRange = (start: moment.Moment, end: moment.Moment) => {
  const data = [];
  const flag = start;
  const f_end = end;

  while (flag.isSameOrBefore(f_end)) {
    data.push({ m: flag, mf: flag.format("YYYY-MM-DD") });
    flag.add(1, "days");
  }
  return data;
};

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [selectDay, setSelectDay] = useState(moment().format("YYYY-MM-DD"));
  const [isShow, setIsShow] = useState(false);

  const sDay = Number(moment(currentMonth).startOf("month").format("d"));
  const sDay_backward = sDay === 0 ? 6 : sDay - 1;

  const eDay = Number(moment(currentMonth).endOf("month").format("d"));
  const eDay_forward = eDay === 0 ? 0 : 7 - eDay;

  const final = () => {
    const calen = CalendarRange(
      moment(currentMonth).startOf("month").subtract(sDay_backward, "d"),
      moment(currentMonth).endOf("month").add(eDay_forward, "d")
    );

    return sliceByNumber(calen, 7);
  };

  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setIsShow(false));

  return (
    <div className={style.calendar_all_wrapper}>
      <div className={style.display_date} onClick={() => setIsShow(!isShow)}>
        {moment(selectDay).format("YYYY年M月D日")}
      </div>
      <div
        ref={ref}
        style={{
          visibility: isShow ? "visible" : "hidden",
        }}
        className={style.calendar_main_wrapper}
      >
        <div className={style.buttons_wrapper}>
          <button
            className={style.prev_button}
            onClick={() =>
              setCurrentMonth(
                moment(currentMonth).subtract(1, "month").format("YYYY-MM-DD")
              )
            }
          >
            {moment(currentMonth).subtract(1, "month").format("M月")}
          </button>
          <button
            className={style.next_button}
            onClick={() =>
              setCurrentMonth(
                moment(currentMonth).add(1, "month").format("YYYY-MM-DD")
              )
            }
          >
            {moment(currentMonth).add(1, "month").format("M月")}
          </button>
        </div>
        <div className={style.weekdays_container}>
          {weekdays.map(({ ja_week }) => {
            return (
              <div className={style.week_box} key={ja_week}>
                {ja_week}
              </div>
            );
          })}
        </div>
        <div className={style.calendar_container}>
          {final().map((week, index) => {
            return (
              <div key={index} className={style.weeks_container}>
                {week.map(({ m, mf }) => {
                  const format_number = moment(mf).format("D");
                  const isCurMonth = moment(mf).isSame(currentMonth, "M")
                    ? moment(mf).isSame(moment().format("YYYY-MM-DD"), "day")
                      ? `${style.is_today}`
                      : ``
                    : `${style.day_except}`;

                  return (
                    <div
                      className={isCurMonth}
                      key={mf}
                      onClick={() => setSelectDay(mf)}
                    >
                      <div data-mf={mf} className={style.day_box}>
                        {format_number}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;

type AnyEvent = MouseEvent | TouchEvent;

const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: AnyEvent) => void
): void => {
  useEffect(() => {
    const listener = (event: AnyEvent) => {
      const el = ref?.current;

      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener(`mousedown`, listener);
    document.addEventListener(`touchstart`, listener);

    return () => {
      document.removeEventListener(`mousedown`, listener);
      document.removeEventListener(`touchstart`, listener);
    };

    // Reload only if ref or handler changes
  }, [ref, handler]);
};