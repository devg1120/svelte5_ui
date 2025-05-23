import {
  SvelteComponent,
  init,
  safe_not_equal,
  component_subscribe,
  set_store_value,
  ensure_array_like,
  noop as noop$1,
  detach,
  destroy_each,
  insert,
  empty,
  attr,
  action_destroyer,
  element,
  append,
  listen as listen$1,
  set_data,
  text,
  run_all,
  is_function,
  transition_out,
  transition_in,
  group_outros,
  check_outros,
  space,
  destroy_component,
  mount_component,
  create_component,
  construct_svelte_component,
  set_style,
} from "svelte/internal";
//import { tick, getContext, setContext, beforeUpdate, afterUpdate } from 'svelte';
import { tick, getContext, setContext } from "svelte";
import { derived, writable, readable, get } from "svelte/store";

function keyEnter(fn) {
  return function (e) {
    return e.key === "Enter" || (e.key === " " && !e.preventDefault()) // prevent page scroll down
      ? fn.call(this, e)
      : undefined;
  };
}

function setContent(node, content) {
  let actions = {
    update(content) {
      if (typeof content == "string") {
        node.innerText = content;
      } else if (content?.domNodes) {
        node.replaceChildren(...content.domNodes);
      } else if (content?.html) {
        node.innerHTML = content.html;
      }
    },
  };
  actions.update(content);

  return actions;
}

/** Dispatch event occurred outside of node */
function outsideEvent(node, type) {
  const handlePointerDown = (jsEvent) => {
    if (node && !node.contains(jsEvent.target)) {
      node.dispatchEvent(
        new CustomEvent(type + "outside", { detail: { jsEvent } }),
      );
    }
  };

  document.addEventListener(type, handlePointerDown, true);

  return {
    destroy() {
      document.removeEventListener(type, handlePointerDown, true);
    },
  };
}

const DAY_IN_SECONDS = 86400;

function createDate(input = undefined) {
  if (input !== undefined) {
    return input instanceof Date
      ? _fromLocalDate(input)
      : _fromISOString(input);
  }

  return _fromLocalDate(new Date());
}

function createDuration(input) {
  if (typeof input === "number") {
    input = { seconds: input };
  } else if (typeof input === "string") {
    // Expected format hh[:mm[:ss]]
    let seconds = 0,
      exp = 2;
    for (let part of input.split(":", 3)) {
      seconds += parseInt(part, 10) * Math.pow(60, exp--);
    }
    input = { seconds };
  } else if (input instanceof Date) {
    input = {
      hours: input.getUTCHours(),
      minutes: input.getUTCMinutes(),
      seconds: input.getUTCSeconds(),
    };
  }

  let weeks = input.weeks || input.week || 0;

  return {
    years: input.years || input.year || 0,
    months: input.months || input.month || 0,
    days: weeks * 7 + (input.days || input.day || 0),
    seconds:
      (input.hours || input.hour || 0) * 60 * 60 +
      (input.minutes || input.minute || 0) * 60 +
      (input.seconds || input.second || 0),
    inWeeks: !!weeks,
  };
}

function cloneDate(date) {
  return new Date(date.getTime());
}

function addDuration(date, duration, x = 1) {
  date.setUTCFullYear(date.getUTCFullYear() + x * duration.years);
  let month = date.getUTCMonth() + x * duration.months;
  date.setUTCMonth(month);
  month %= 12;
  if (month < 0) {
    month += 12;
  }
  while (date.getUTCMonth() !== month) {
    subtractDay(date);
  }
  date.setUTCDate(date.getUTCDate() + x * duration.days);
  date.setUTCSeconds(date.getUTCSeconds() + x * duration.seconds);

  return date;
}

function subtractDuration(date, duration, x = 1) {
  return addDuration(date, duration, -x);
}

function addDay(date, x = 1) {
  date.setUTCDate(date.getUTCDate() + x);

  return date;
}

function subtractDay(date, x = 1) {
  return addDay(date, -x);
}

function setMidnight(date) {
  date.setUTCHours(0, 0, 0, 0);

  return date;
}

function toLocalDate(date) {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  );
}

function toISOString(date, len = 19) {
  return date.toISOString().substring(0, len);
}

function datesEqual(date1, ...dates2) {
  return dates2.every((date2) => date1.getTime() === date2.getTime());
}

function nextClosestDay(date, day) {
  let diff = day - date.getUTCDay();
  date.setUTCDate(date.getUTCDate() + (diff >= 0 ? diff : diff + 7));
  return date;
}

function prevClosestDay(date, day) {
  let diff = day - date.getUTCDay();
  date.setUTCDate(date.getUTCDate() + (diff <= 0 ? diff : diff - 7));
  return date;
}

/**
 * Check whether given date is string which contains no time part
 */
function noTimePart(date) {
  return typeof date === "string" && date.length <= 10;
}

/**
 * Copy time from one date to another
 */
function copyTime(toDate, fromDate) {
  toDate.setUTCHours(
    fromDate.getUTCHours(),
    fromDate.getUTCMinutes(),
    fromDate.getUTCSeconds(),
    0,
  );

  return toDate;
}

/**
 * Get duration value in seconds
 */
function toSeconds(duration) {
  return duration.seconds;
}

/**
 * Move the date forward (when pressing the next button)
 */
function nextDate(date, duration) {
  addDuration(date, duration);
  return date;
}

/**
 * Move the date backward (when pressing the prev button)
 */
function prevDate(date, duration, hiddenDays) {
  subtractDuration(date, duration);
  if (hiddenDays.length && hiddenDays.length < 7) {
    while (hiddenDays.includes(date.getUTCDay())) {
      subtractDay(date);
    }
  }
  return date;
}

/**
 * For a given date, get its week number
 *  - ISO @see https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php
 *  - Western @see https://en.wikipedia.org/wiki/Week#Other_week_numbering_systems
 */
function getWeekNumber(date, firstDay) {
  // Copy date so don't modify original
  date = cloneDate(date);
  if (firstDay == 0) {
    // Western
    // Set to nearest Saturday: current date + 6 - current day number
    date.setUTCDate(date.getUTCDate() + 6 - date.getUTCDay());
  } else {
    // ISO
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  }
  // Get first day of year
  let yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  // Calculate full weeks to `date`
  return Math.ceil(((date - yearStart) / 1000 / DAY_IN_SECONDS + 1) / 7);
}

/**
 * Private functions
 */

function _fromLocalDate(date) {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
    ),
  );
}

function _fromISOString(str) {
  const parts = str.match(/\d+/g);
  return new Date(
    Date.UTC(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2]),
      Number(parts[3] || 0),
      Number(parts[4] || 0),
      Number(parts[5] || 0),
    ),
  );
}

function assign(...args) {
  return Object.assign(...args);
}

function keys(object) {
  return Object.keys(object);
}

function floor(value) {
  return Math.floor(value);
}

function ceil(value) {
  return Math.ceil(value);
}

function min(...args) {
  return Math.min(...args);
}

function max(...args) {
  return Math.max(...args);
}

function symbol() {
  return Symbol("ec");
}

function isArray(value) {
  return Array.isArray(value);
}

function isFunction(value) {
  return typeof value === "function";
}

function run(fn) {
  return fn();
}

function runAll(fns) {
  fns.forEach(run);
}

function noop() {}

const identity = (x) => x;

function debounce(fn, handle, queueStore) {
  queueStore.update((queue) => queue.set(handle, fn));
}

function flushDebounce(queue) {
  runAll(queue);
  queue.clear();
}

function task(fn, handle, tasks) {
  handle ??= fn;
  if (!tasks.has(handle)) {
    tasks.set(
      handle,
      setTimeout(() => {
        tasks.delete(handle);
        fn();
      }),
    );
  }
}

let payloadProp = symbol();
function setPayload(obj, payload) {
  obj[payloadProp] = payload;
}

function hasPayload(obj) {
  return !!obj?.[payloadProp];
}

function getPayload(obj) {
  return obj[payloadProp];
}

function createElement(tag, className, content, attrs = []) {
  let el = document.createElement(tag);
  el.className = className;
  if (typeof content == "string") {
    el.innerText = content;
  } else if (content.domNodes) {
    el.replaceChildren(...content.domNodes);
  } else if (content.html) {
    el.innerHTML = content.html;
  }
  for (let attr of attrs) {
    el.setAttribute(...attr);
  }
  return el;
}

function hasYScroll(el) {
  return el.scrollHeight > el.clientHeight;
}

function rect(el) {
  return el.getBoundingClientRect();
}

function ancestor(el, up) {
  while (up--) {
    el = el.parentElement;
  }
  return el;
}

function height(el) {
  return rect(el).height;
}

function getElementWithPayload(x, y, root = document) {
  for (let el of root.elementsFromPoint(x, y)) {
    if (hasPayload(el)) {
      return el;
    }
    /** @see https://github.com/vkurko/calendar/issues/142 */
    if (el.shadowRoot) {
      let shadowEl = getElementWithPayload(x, y, el.shadowRoot);
      if (shadowEl) {
        return shadowEl;
      }
    }
  }
  return null;
}

function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}

function createView(view, _viewTitle, _currentRange, _activeRange) {
  return {
    type: view,
    title: _viewTitle,
    currentStart: _currentRange.start,
    currentEnd: _currentRange.end,
    activeStart: _activeRange.start,
    activeEnd: _activeRange.end,
    calendar: undefined,
  };
}

function toViewWithLocalDates(view) {
  view = assign({}, view);
  view.currentStart = toLocalDate(view.currentStart);
  view.currentEnd = toLocalDate(view.currentEnd);
  view.activeStart = toLocalDate(view.activeStart);
  view.activeEnd = toLocalDate(view.activeEnd);

  return view;
}

function listView(view) {
  return view.startsWith("list");
}

function timelineView(view) {
  return view.includes("Timeline");
}

let eventId = 1;
function createEvents(input) {
  return input.map((event) => {
    let result = {
      id: "id" in event ? String(event.id) : `{generated-${eventId++}}`,
      resourceIds: toArrayProp(event, "resourceId").map(String),
      allDay:
        event.allDay ?? (noTimePart(event.start) && noTimePart(event.end)),
      start: createDate(event.start),
      end: createDate(event.end),
      title: event.title ?? "",
      editable: event.editable,
      startEditable: event.startEditable,
      durationEditable: event.durationEditable,
      display: event.display ?? "auto",
      extendedProps: event.extendedProps ?? {},
      backgroundColor: event.backgroundColor ?? event.color,
      textColor: event.textColor,
      classNames: toArrayProp(event, "className"),
      styles: toArrayProp(event, "style"),
    };

    if (result.allDay) {
      // Make sure all-day events start and end at midnight
      setMidnight(result.start);
      let end = cloneDate(result.end);
      setMidnight(result.end);
      if (
        !datesEqual(result.end, end) ||
        datesEqual(
          result.end,
          result.start,
        ) /** @see https://github.com/vkurko/calendar/issues/50 */
      ) {
        addDay(result.end);
      }
    }

    return result;
  });
}

function toArrayProp(input, propName) {
  let result = input[propName + "s"] ?? input[propName] ?? [];
  return isArray(result) ? result : [result];
}

function createEventSources(input) {
  return input.map((source) => ({
    events: source.events,
    url: (source.url && source.url.trimEnd("&")) || "",
    method: (source.method && source.method.toUpperCase()) || "GET",
    extraParams: source.extraParams || {},
  }));
}

function createEventChunk(event, start, end) {
  let chunk = {
    start: event.start > start ? event.start : start,
    end: event.end < end ? event.end : end,
    event,
  };
  chunk.zeroDuration = datesEqual(chunk.start, chunk.end);

  return chunk;
}

function sortEventChunks(chunks) {
  // Sort by start date (all-day events always on top)
  chunks.sort((a, b) => a.start - b.start || b.event.allDay - a.event.allDay);
}

function createEventContent(
  chunk,
  displayEventEnd,
  eventContent,
  theme,
  _intlEventTime,
  _view,
) {
  let timeText = _intlEventTime.formatRange(
    chunk.start,
    displayEventEnd && chunk.event.display !== "pointer" && !chunk.zeroDuration
      ? copyTime(cloneDate(chunk.start), chunk.end) // make Intl.formatRange output only the time part
      : chunk.start,
  );
  let content;

  if (eventContent) {
    content = isFunction(eventContent)
      ? eventContent({
          event: toEventWithLocalDates(chunk.event),
          timeText,
          view: toViewWithLocalDates(_view),
        })
      : eventContent;
  }

  if (content === undefined) {
    let domNodes;
    switch (chunk.event.display) {
      case "background":
        domNodes = [];
        break;
      case "pointer":
        domNodes = [createTimeElement(timeText, chunk, theme)];
        break;
      default:
        domNodes = [
          ...(chunk.event.allDay
            ? []
            : [createTimeElement(timeText, chunk, theme)]),
          createElement("h4", theme.eventTitle, chunk.event.title),
        ];
    }
    content = { domNodes };
  }

  return [timeText, content];
}

function createTimeElement(timeText, chunk, theme) {
  return createElement("time", theme.eventTime, timeText, [
    ["datetime", toISOString(chunk.start)],
  ]);
}

function createEventClasses(eventClassNames, event, _view) {
  let result = event.classNames;
  if (eventClassNames) {
    if (isFunction(eventClassNames)) {
      eventClassNames = eventClassNames({
        event: toEventWithLocalDates(event),
        view: toViewWithLocalDates(_view),
      });
    }
    result = [
      ...(isArray(eventClassNames) ? eventClassNames : [eventClassNames]),
      ...result,
    ];
  }
  return result;
}

function toEventWithLocalDates(event) {
  return _cloneEvent(event, toLocalDate);
}

function cloneEvent(event) {
  return _cloneEvent(event, cloneDate);
}

function _cloneEvent(event, dateFn) {
  event = assign({}, event);
  event.start = dateFn(event.start);
  event.end = dateFn(event.end);

  return event;
}

/**
 * Prepare event chunks for month view and all-day slot in week view
 */
function prepareEventChunks(chunks, hiddenDays) {
  let longChunks = {};

  if (chunks.length) {
    sortEventChunks(chunks);

    let prevChunk;
    for (let chunk of chunks) {
      let dates = [];
      let date = setMidnight(cloneDate(chunk.start));
      while (chunk.end > date) {
        if (!hiddenDays.includes(date.getUTCDay())) {
          dates.push(cloneDate(date));
          if (dates.length > 1) {
            let key = date.getTime();
            if (longChunks[key]) {
              longChunks[key].chunks.push(chunk);
            } else {
              longChunks[key] = {
                sorted: false,
                chunks: [chunk],
              };
            }
          }
        }
        addDay(date);
      }
      if (dates.length) {
        chunk.date = dates[0];
        chunk.days = dates.length;
        chunk.dates = dates;
        // Adjust the start and end dates of the chunk if hidden days affected them
        if (chunk.start < dates[0]) {
          chunk.start = dates[0];
        }
        let maxEnd = addDay(cloneDate(dates.at(-1)));
        if (chunk.end > maxEnd) {
          chunk.end = maxEnd;
        }
      } else {
        chunk.date = setMidnight(cloneDate(chunk.start));
        chunk.days = 1;
        chunk.dates = [chunk.date];
      }

      if (prevChunk && datesEqual(prevChunk.date, chunk.date)) {
        chunk.prev = prevChunk;
      }
      prevChunk = chunk;
    }
  }

  return longChunks;
}

function repositionEvent(chunk, longChunks, height) {
  chunk.top = 0;
  if (chunk.prev) {
    chunk.top = chunk.prev.bottom + 1;
  }
  chunk.bottom = chunk.top + height;
  let margin = 1;
  let key = chunk.date.getTime();
  if (longChunks[key]) {
    if (!longChunks[key].sorted) {
      longChunks[key].chunks.sort((a, b) => a.top - b.top);
      longChunks[key].sorted = true;
    }
    for (let longChunk of longChunks[key].chunks) {
      if (chunk.top < longChunk.bottom && chunk.bottom > longChunk.top) {
        let offset = longChunk.bottom - chunk.top + 1;
        margin += offset;
        chunk.top += offset;
        chunk.bottom += offset;
      }
    }
  }

  return margin;
}

function runReposition(refs, data) {
  refs.length = data.length;
  let result = [];
  for (let ref of refs) {
    result.push(ref?.reposition?.());
  }
  return result;
}

/**
 * Check whether the event intersects with the given date range and resources
 * @param event
 * @param start
 * @param end
 * @param resources
 * @return boolean
 */
function eventIntersects(event, start, end, resources) {
  if (event.start < end && event.end > start) {
    if (resources) {
      if (!isArray(resources)) {
        resources = [resources];
      }
      return resources.some((resource) =>
        event.resourceIds.includes(resource.id),
      );
    }
    return true;
  }
  return false;
}

function helperEvent(display) {
  return previewEvent(display) || ghostEvent(display) || pointerEvent(display);
}

function bgEvent(display) {
  return display === "background";
}

function previewEvent(display) {
  return display === "preview";
}

function ghostEvent(display) {
  return display === "ghost";
}

function pointerEvent(display) {
  return display === "pointer";
}

function btnTextDay(text) {
  return btnText(text, "day");
}

function btnTextWeek(text) {
  return btnText(text, "week");
}

function btnTextMonth(text) {
  return btnText(text, "month");
}

function btnTextYear(text) {
  return btnText(text, "year");
}

function btnText(text, period) {
  return {
    ...text,
    next: "Next " + period,
    prev: "Previous " + period,
  };
}

function themeView(view) {
  return (theme) => ({ ...theme, view });
}

function createDateRange(input) {
  let start, end;
  if (input) {
    ({ start, end } = input);
    if (start) {
      start = setMidnight(createDate(start));
    }
    if (end) {
      end = setMidnight(createDate(end));
    }
  }
  return { start, end };
}

function outsideRange(date, range) {
  return (range.start && date < range.start) || (range.end && date > range.end);
}

function limitToRange(date, range) {
  if (range.start && date < range.start) {
    date = range.start;
  }
  if (range.end && date > range.end) {
    date = range.end;
  }
  return date;
}

function createResources(input) {
  let result = [];
  _createResources(input, 0, result);
  return result;
}

function _createResources(input, level, flat) {
  let result = [];
  for (let item of input) {
    let resource = createResource(item);
    result.push(resource);
    flat.push(resource);
    let payload = {
      level,
      children: [],
      expanded: true,
      hidden: false,
    };
    setPayload(resource, payload);
    if (item.children) {
      payload.children = _createResources(item.children, level + 1, flat);
    }
  }
  return result;
}

function createResource(input) {
  return {
    id: String(input.id),
    title: input.title || "",
    eventBackgroundColor: input.eventBackgroundColor,
    eventTextColor: input.eventTextColor,
    extendedProps: input.extendedProps ?? {},
  };
}

function resourceBackgroundColor(event, resources) {
  return findResource(event, resources)?.eventBackgroundColor;
}

function resourceTextColor(event, resources) {
  return findResource(event, resources)?.eventTextColor;
}

function findResource(event, resources) {
  return resources.find((resource) => event.resourceIds.includes(resource.id));
}

function intl(locale, format) {
  return derived([locale, format], ([$locale, $format]) => {
    let intl = isFunction($format)
      ? { format: $format }
      : new Intl.DateTimeFormat($locale, $format);
    return {
      format: (date) => intl.format(toLocalDate(date)),
    };
  });
}

function intlRange(locale, format) {
  return derived([locale, format], ([$locale, $format]) => {
    let formatRange;
    if (isFunction($format)) {
      formatRange = $format;
    } else {
      let intl = new Intl.DateTimeFormat($locale, $format);
      formatRange = (start, end) => {
        if (start <= end) {
          return intl.formatRange(start, end);
        } else {
          // In iOS 16 and older, intl.formatRange() throws an exception if the start date is later than the end date.
          // Therefore, we first swap the parameters, and then swap the resulting parts.
          /** @see https://github.com/vkurko/calendar/issues/227 */
          let parts = intl.formatRangeToParts(end, start);
          let result = "";
          let sources = ["startRange", "endRange"];
          let processed = [false, false];
          for (let part of parts) {
            let i = sources.indexOf(part.source);
            if (i >= 0) {
              if (!processed[i]) {
                result += _getParts(sources[1 - i], parts);
                processed[i] = true;
              }
            } else {
              result += part.value;
            }
          }
          return result;
        }
      };
    }
    return {
      formatRange: (start, end) =>
        formatRange(toLocalDate(start), toLocalDate(end)),
    };
  });
}

function _getParts(source, parts) {
  let result = "";
  for (let part of parts) {
    if (part.source == source) {
      result += part.value;
    }
  }
  return result;
}

function viewResources(state) {
  return derived(
    [
      state.resources,
      state.filterResourcesWithEvents,
      state._events,
      state._activeRange,
    ],
    ([$resources, $filterResourcesWithEvents, $_events, $_activeRange]) => {
      let result = $resources.filter(
        (resource) => !getPayload(resource).hidden,
      );

      if ($filterResourcesWithEvents) {
        result = $resources.filter((resource) => {
          for (let event of $_events) {
            if (
              event.display !== "background" &&
              event.resourceIds.includes(resource.id) &&
              event.start < $_activeRange.end &&
              event.end > $_activeRange.start
            ) {
              return true;
            }
          }
          return false;
        });
      }

      if (!result.length) {
        result = createResources([{}]);
      }

      return result;
    },
  );
}

function createTimes(date, $slotDuration, $_slotTimeLimits, $_intlSlotLabel) {
  date = cloneDate(date);
  let compact = $slotDuration.seconds < 3600;
  let times = [];
  let end = cloneDate(date);
  let i = 1;
  addDuration(date, $_slotTimeLimits.min);
  addDuration(end, $_slotTimeLimits.max);
  while (date < end) {
    times.push([
      toISOString(date),
      $_intlSlotLabel.format(date),
      times.length && (i || !compact),
    ]);
    addDuration(date, $slotDuration);
    i = 1 - i;
  }

  return times;
}

function createSlotTimeLimits(
  $slotMinTime,
  $slotMaxTime,
  $flexibleSlotTimeLimits,
  $_viewDates,
  $_events,
) {
  let min$1 = createDuration($slotMinTime);
  let max$1 = createDuration($slotMaxTime);

  if ($flexibleSlotTimeLimits) {
    // If slotMaxTime goes past midnight, then extend it back by a maximum of 24 hours
    let minMin = createDuration(
      min(toSeconds(min$1), max(0, toSeconds(max$1) - DAY_IN_SECONDS)),
    );
    let maxMax = createDuration(
      max(toSeconds(max$1), toSeconds(minMin) + DAY_IN_SECONDS),
    );
    let filter = isFunction($flexibleSlotTimeLimits?.eventFilter)
      ? $flexibleSlotTimeLimits.eventFilter
      : (event) => !bgEvent(event.display);
    loop: for (let date of $_viewDates) {
      let start = addDuration(cloneDate(date), min$1);
      let end = addDuration(cloneDate(date), max$1);
      let minStart = addDuration(cloneDate(date), minMin);
      let maxEnd = addDuration(cloneDate(date), maxMax);
      for (let event of $_events) {
        if (
          !event.allDay &&
          filter(event) &&
          event.start < maxEnd &&
          event.end > minStart
        ) {
          if (event.start < start) {
            let seconds = max((event.start - date) / 1000, toSeconds(minMin));
            if (seconds < toSeconds(min$1)) {
              min$1.seconds = seconds;
            }
          }
          if (event.end > end) {
            let seconds = min((event.end - date) / 1000, toSeconds(maxMax));
            if (seconds > toSeconds(max$1)) {
              max$1.seconds = seconds;
            }
          }
          if (
            toSeconds(min$1) === toSeconds(minMin) &&
            toSeconds(max$1) === toSeconds(maxMax)
          ) {
            break loop;
          }
        }
      }
    }
  }

  return { min: min$1, max: max$1 };
}

function createOptions(plugins) {
  let options = {
    allDayContent: undefined,
    allDaySlot: true,
    buttonText: {
      today: "today",
    },
    customButtons: {},
    date: new Date(),
    datesSet: undefined,
    dayHeaderFormat: {
      weekday: "short",
      month: "numeric",
      day: "numeric",
    },
    dayHeaderAriaLabelFormat: {
      dateStyle: "full",
    },
    displayEventEnd: true,
    duration: { weeks: 1 },
    events: [],
    eventAllUpdated: undefined,
    eventBackgroundColor: undefined,
    eventTextColor: undefined,
    eventClassNames: undefined,
    eventClick: undefined,
    eventColor: undefined,
    eventContent: undefined,
    eventDidMount: undefined,
    eventMouseEnter: undefined,
    eventMouseLeave: undefined,
    eventSources: [],
    eventTimeFormat: {
      hour: "numeric",
      minute: "2-digit",
    },
    filterEventsWithResources: false,
    filterResourcesWithEvents: false,
    firstDay: 0,
    flexibleSlotTimeLimits: false, // ec option
    headerToolbar: {
      start: "title",
      center: "",
      end: "today prev,next",
    },
    height: undefined,
    hiddenDays: [],
    highlightedDates: [], // ec option
    lazyFetching: true,
    loading: undefined,
    locale: undefined,
    nowIndicator: false,
    resourceLabelContent: undefined,
    resourceLabelDidMount: undefined,
    resources: [],
    selectable: false,
    scrollTime: "06:00:00",
    slotDuration: "00:30:00",
    slotEventOverlap: true,
    slotHeight: 24, // ec option
    slotLabelFormat: {
      hour: "numeric",
      minute: "2-digit",
    },
    slotMaxTime: "24:00:00",
    slotMinTime: "00:00:00",
    slotWidth: 72,
    theme: {
      allDay: "ec-all-day",
      active: "ec-active",
      bgEvent: "ec-bg-event",
      bgEvents: "ec-bg-events",
      body: "ec-body",
      button: "ec-button",
      buttonGroup: "ec-button-group",
      calendar: "ec",
      compact: "ec-compact",
      content: "ec-content",
      day: "ec-day",
      dayHead: "ec-day-head",
      days: "ec-days",
      disabled: "ec-disabled",
      event: "ec-event",
      eventBody: "ec-event-body",
      eventTime: "ec-event-time",
      eventTitle: "ec-event-title",
      events: "ec-events",
      extra: "ec-extra",
      handle: "ec-handle",
      header: "ec-header",
      hiddenScroll: "ec-hidden-scroll",
      highlight: "ec-highlight",
      icon: "ec-icon",
      line: "ec-line",
      lines: "ec-lines",
      nowIndicator: "ec-now-indicator",
      otherMonth: "ec-other-month",
      resource: "ec-resource",
      sidebar: "ec-sidebar",
      sidebarTitle: "ec-sidebar-title",
      today: "ec-today",
      time: "ec-time",
      title: "ec-title",
      toolbar: "ec-toolbar",
      view: "",
      weekdays: [
        "ec-sun",
        "ec-mon",
        "ec-tue",
        "ec-wed",
        "ec-thu",
        "ec-fri",
        "ec-sat",
      ],
      withScroll: "ec-with-scroll",
    },
    titleFormat: {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
    validRange: undefined,
    view: undefined,
    viewDidMount: undefined,
    views: {},
  };

  for (let plugin of plugins) {
    plugin.createOptions?.(options);
  }

  return options;
}

function createParsers(plugins) {
  let parsers = {
    date: (date) => setMidnight(createDate(date)),
    duration: createDuration,
    events: createEvents,
    eventSources: createEventSources,
    hiddenDays: (days) => [...new Set(days)],
    highlightedDates: (dates) =>
      dates.map((date) => setMidnight(createDate(date))),
    resources: createResources,
    scrollTime: createDuration,
    slotDuration: createDuration,
    slotMaxTime: createDuration,
    slotMinTime: createDuration,
    validRange: createDateRange,
  };

  for (let plugin of plugins) {
    plugin.createParsers?.(parsers);
  }

  return parsers;
}

function diff(options, prevOptions) {
  let diff = [];
  for (let key of keys(options)) {
    if (options[key] !== prevOptions[key]) {
      diff.push([key, options[key]]);
    }
  }
  assign(prevOptions, options);

  return diff;
}

function dayGrid(state) {
  return derived(state.view, ($view) => $view?.startsWith("dayGrid"));
}

function activeRange(state) {
  return derived(
    [state._currentRange, state.firstDay, state.slotMaxTime, state._dayGrid],
    ([$_currentRange, $firstDay, $slotMaxTime, $_dayGrid]) => {
      let start = cloneDate($_currentRange.start);
      let end = cloneDate($_currentRange.end);

      if ($_dayGrid) {
        // First day of week
        prevClosestDay(start, $firstDay);
        nextClosestDay(end, $firstDay);
      } else if ($slotMaxTime.days || $slotMaxTime.seconds > DAY_IN_SECONDS) {
        addDuration(subtractDay(end), $slotMaxTime);
        let start2 = subtractDay(cloneDate(end));
        if (start2 < start) {
          start = start2;
        }
      }

      return { start, end };
    },
  );
}

function currentRange(state) {
  return derived(
    [state.date, state.duration, state.firstDay],
    ([$date, $duration, $firstDay]) => {
      let start = cloneDate($date),
        end;
      if ($duration.months) {
        start.setUTCDate(1);
      } else if ($duration.inWeeks) {
        // First day of week
        prevClosestDay(start, $firstDay);
      }
      end = addDuration(cloneDate(start), $duration);

      return { start, end };
    },
  );
}

function viewDates(state) {
  return derived(
    [state._activeRange, state.hiddenDays],
    ([$_activeRange, $hiddenDays]) => {
      let dates = [];
      let date = setMidnight(cloneDate($_activeRange.start));
      let end = setMidnight(cloneDate($_activeRange.end));
      while (date < end) {
        if (!$hiddenDays.includes(date.getUTCDay())) {
          dates.push(cloneDate(date));
        }
        addDay(date);
      }
      if (!dates.length && $hiddenDays.length && $hiddenDays.length < 7) {
        // Try to move the date
        state.date.update((date) => {
          while ($hiddenDays.includes(date.getUTCDay())) {
            addDay(date);
          }
          return date;
        });
        dates = get(state._viewDates);
      }

      return dates;
    },
  );
}

function viewTitle(state) {
  return derived(
    [state.date, state._activeRange, state._intlTitle, state._dayGrid],
    ([$date, $_activeRange, $_intlTitle, $_dayGrid]) => {
      return $_dayGrid
        ? $_intlTitle.formatRange($date, $date)
        : $_intlTitle.formatRange(
            $_activeRange.start,
            subtractDay(cloneDate($_activeRange.end)),
          );
    },
  );
}

function view(state) {
  return derived(
    [state.view, state._viewTitle, state._currentRange, state._activeRange],
    (args) => createView(...args),
  );
}

function events(state) {
  let _events = writable([]);
  let abortController;
  let fetching = 0;
  let debounceHandle = {};
  derived(
    [
      state.events,
      state.eventSources,
      state._activeRange,
      state._fetchedRange,
      state.lazyFetching,
      state.loading,
    ],
    (values, set) =>
      debounce(
        () => {
          let [
            $events,
            $eventSources,
            $_activeRange,
            $_fetchedRange,
            $lazyFetching,
            $loading,
          ] = values;
          if (!$eventSources.length) {
            set($events);
            return;
          }
          // Do not fetch if new range is within the previous one
          if (
            !$_fetchedRange.start ||
            $_fetchedRange.start > $_activeRange.start ||
            $_fetchedRange.end < $_activeRange.end ||
            !$lazyFetching
          ) {
            if (abortController) {
              // Abort previous request
              abortController.abort();
            }
            // Create new abort controller
            abortController = new AbortController();
            // Call loading hook
            if (isFunction($loading) && !fetching) {
              $loading(true);
            }
            let stopLoading = () => {
              if (--fetching === 0 && isFunction($loading)) {
                $loading(false);
              }
            };
            let events = [];
            // Prepare handlers
            let failure = (e) => stopLoading();
            let success = (data) => {
              events = events.concat(createEvents(data));
              set(events);
              stopLoading();
            };
            // Prepare other stuff
            let startStr = toISOString($_activeRange.start);
            let endStr = toISOString($_activeRange.end);
            // Loop over event sources
            for (let source of $eventSources) {
              if (isFunction(source.events)) {
                // Events as a function
                let result = source.events(
                  {
                    start: toLocalDate($_activeRange.start),
                    end: toLocalDate($_activeRange.end),
                    startStr,
                    endStr,
                  },
                  success,
                  failure,
                );
                if (result !== undefined) {
                  Promise.resolve(result).then(success, failure);
                }
              } else {
                // Events as a JSON feed
                // Prepare params
                let params = isFunction(source.extraParams)
                  ? source.extraParams()
                  : assign({}, source.extraParams);
                params.start = startStr;
                params.end = endStr;
                params = new URLSearchParams(params);
                // Prepare fetch
                let url = source.url,
                  headers = {},
                  body;
                if (["GET", "HEAD"].includes(source.method)) {
                  url += (url.includes("?") ? "&" : "?") + params;
                } else {
                  headers["content-type"] =
                    "application/x-www-form-urlencoded;charset=UTF-8";
                  body = String(params); // Safari 10.1 doesn't convert to string automatically
                }
                // Do the fetch
                fetch(url, {
                  method: source.method,
                  headers,
                  body,
                  signal: abortController.signal,
                  credentials: "same-origin",
                })
                  .then((response) => response.json())
                  .then(success)
                  .catch(failure);
              }
              ++fetching;
            }
            // Save current range for future requests
            $_fetchedRange.start = $_activeRange.start;
            $_fetchedRange.end = $_activeRange.end;
          }
        },
        debounceHandle,
        state._queue,
      ),
    [],
  ).subscribe(_events.set);

  return _events;
}

function now() {
  return readable(createDate(), (set) => {
    let interval = setInterval(() => {
      set(createDate());
    }, 1000);

    return () => clearInterval(interval);
  });
}

function today(state) {
  return derived(state._now, ($_now) => setMidnight(cloneDate($_now)));
}

class State {
  constructor(plugins, input) {
    plugins = plugins || [];

    // Create options
    let options = createOptions(plugins);
    let parsers = createParsers(plugins);

    // Parse options
    options = parseOpts(options, parsers);
    input = parseOpts(input, parsers);

    // Create stores for options
    for (let [option, value] of Object.entries(options)) {
      this[option] = writable(value);
    }

    // Private stores
    this._queue = writable(new Map()); // debounce queue (beforeUpdate)
    this._queue2 = writable(new Map()); // debounce queue (afterUpdate)
    this._tasks = new Map(); // timeout IDs for tasks
    this._auxiliary = writable([]); // auxiliary components
    this._dayGrid = dayGrid(this);
    this._currentRange = currentRange(this);
    this._activeRange = activeRange(this);
    this._fetchedRange = writable({ start: undefined, end: undefined });
    this._events = events(this);
    this._now = now();
    this._today = today(this);
    this._intlEventTime = intlRange(this.locale, this.eventTimeFormat);
    this._intlSlotLabel = intl(this.locale, this.slotLabelFormat);
    this._intlDayHeader = intl(this.locale, this.dayHeaderFormat);
    this._intlDayHeaderAL = intl(this.locale, this.dayHeaderAriaLabelFormat);
    this._intlTitle = intlRange(this.locale, this.titleFormat);
    this._bodyEl = writable(undefined);
    this._scrollable = writable(false);
    this._viewTitle = viewTitle(this);
    this._viewDates = viewDates(this);
    this._view = view(this);
    this._viewComponent = writable(undefined);
    // Interaction
    this._interaction = writable({});
    this._iEvents = writable([null, null]); // interaction events: [drag/resize, pointer]
    this._iClasses = writable(identity); // interaction event css classes
    this._iClass = writable(undefined); // interaction css class for entire calendar

    // Set & Get
    this._set = (key, value) => {
      if (validKey(key, this)) {
        if (parsers[key]) {
          value = parsers[key](value);
        }
        this[key].set(value);
      }
    };
    this._get = (key) => (validKey(key, this) ? get(this[key]) : undefined);

    // Let plugins create their private stores
    for (let plugin of plugins) {
      plugin.createStores?.(this);
    }

    if (input.view) {
      // Set initial view based on input
      this.view.set(input.view);
    }

    // Set options for each view
    let views = new Set([...keys(options.views), ...keys(input.views ?? {})]);
    for (let view of views) {
      let defOpts = mergeOpts(options, options.views[view] ?? {});
      let opts = mergeOpts(defOpts, input, input.views?.[view] ?? {});
      let component = opts.component;
      // Make sure we deal with valid opts from now on
      filterOpts(opts, this);
      // Process options
      for (let key of keys(opts)) {
        let { set, _set = set, ...rest } = this[key];

        this[key] = {
          // Set value in all views
          set: ["buttonText", "theme"].includes(key)
            ? (value) => {
                if (isFunction(value)) {
                  let result = value(defOpts[key]);
                  opts[key] = result;
                  set(set === _set ? result : value);
                } else {
                  opts[key] = value;
                  set(value);
                }
              }
            : (value) => {
                opts[key] = value;
                set(value);
              },
          _set,
          ...rest,
        };
      }
      // When view changes...
      this.view.subscribe((newView) => {
        if (newView === view) {
          // switch view component
          this._viewComponent.set(component);
          if (isFunction(opts.viewDidMount)) {
            tick().then(() => opts.viewDidMount(get(this._view)));
          }
          // update store values
          for (let key of keys(opts)) {
            this[key]._set(opts[key]);
          }
        }
      });
    }
  }
}

function parseOpts(opts, parsers) {
  let result = { ...opts };
  for (let key of keys(parsers)) {
    if (key in result) {
      result[key] = parsers[key](result[key]);
    }
  }
  if (opts.views) {
    result.views = {};
    for (let view of keys(opts.views)) {
      result.views[view] = parseOpts(opts.views[view], parsers);
    }
  }
  return result;
}

function mergeOpts(...args) {
  let result = {};
  for (let opts of args) {
    let override = {};
    for (let key of ["buttonText", "theme"]) {
      if (isFunction(opts[key])) {
        override[key] = opts[key](result[key]);
      }
    }
    result = {
      ...result,
      ...opts,
      ...override,
    };
  }
  return result;
}

function filterOpts(opts, state) {
  keys(opts)
    .filter((key) => !validKey(key, state) || key == "view")
    .forEach((key) => delete opts[key]);
}

function validKey(key, state) {
  return state.hasOwnProperty(key) && key[0] !== "_";
}

/* packages/core/src/Buttons.svelte generated by Svelte v4.2.19 */

function get_each_context$2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[34] = list[i];
  return child_ctx;
}

// (90:27)
function create_if_block_5(ctx) {
  let button_1;
  let t_value = /*$buttonText*/ ctx[7][/*button*/ ctx[34]] + "";
  let t;
  let button_1_class_value;
  let mounted;
  let dispose;

  function click_handler_1() {
    return /*click_handler_1*/ ctx[29](/*button*/ ctx[34]);
  }

  return {
    c() {
      button_1 = element("button");
      t = text(t_value);

      attr(
        button_1,
        "class",
        (button_1_class_value =
          "" +
          /*$theme*/ (ctx[5].button +
            /*$view*/ (ctx[9] === /*button*/ ctx[34]
              ? " " + /*$theme*/ ctx[5].active
              : "") +
            " ec-" +
            /*button*/ ctx[34])),
      );
    },
    m(target, anchor) {
      insert(target, button_1, anchor);
      append(button_1, t);

      if (!mounted) {
        dispose = listen$1(button_1, "click", click_handler_1);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (
        dirty[0] & /*$buttonText, buttons*/ 129 &&
        t_value !== (t_value = /*$buttonText*/ ctx[7][/*button*/ ctx[34]] + "")
      )
        set_data(t, t_value);

      if (
        dirty[0] & /*$theme, $view, buttons*/ 545 &&
        button_1_class_value !==
          (button_1_class_value =
            "" +
            /*$theme*/ (ctx[5].button +
              /*$view*/ (ctx[9] === /*button*/ ctx[34]
                ? " " + /*$theme*/ ctx[5].active
                : "") +
              " ec-" +
              /*button*/ ctx[34]))
      ) {
        attr(button_1, "class", button_1_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(button_1);
      }

      mounted = false;
      dispose();
    },
  };
}

// (84:37)
function create_if_block_4(ctx) {
  let button_1;
  let button_1_class_value;
  let setContent_action;
  let mounted;
  let dispose;

  return {
    c() {
      button_1 = element("button");

      attr(
        button_1,
        "class",
        (button_1_class_value =
          "" +
          /*$theme*/ (ctx[5].button +
            " ec-" +
            /*button*/ ctx[34] +
            /*$customButtons*/ (ctx[8][/*button*/ ctx[34]].active
              ? " " + /*$theme*/ ctx[5].active
              : ""))),
      );
    },
    m(target, anchor) {
      insert(target, button_1, anchor);

      if (!mounted) {
        dispose = [
          listen$1(button_1, "click", function () {
            if (
              is_function(/*$customButtons*/ ctx[8][/*button*/ ctx[34]].click)
            )
              /*$customButtons*/ ctx[8][/*button*/ ctx[34]].click.apply(
                this,
                arguments,
              );
          }),
          action_destroyer(
            (setContent_action = setContent.call(
              null,
              button_1,
              /*$customButtons*/ ctx[8][/*button*/ ctx[34]].text,
            )),
          ),
        ];

        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;

      if (
        dirty[0] & /*$theme, buttons, $customButtons*/ 289 &&
        button_1_class_value !==
          (button_1_class_value =
            "" +
            /*$theme*/ (ctx[5].button +
              " ec-" +
              /*button*/ ctx[34] +
              /*$customButtons*/ (ctx[8][/*button*/ ctx[34]].active
                ? " " + /*$theme*/ ctx[5].active
                : "")))
      ) {
        attr(button_1, "class", button_1_class_value);
      }

      if (
        setContent_action &&
        is_function(setContent_action.update) &&
        dirty[0] & /*$customButtons, buttons*/ 257
      )
        setContent_action.update.call(
          null,
          /*$customButtons*/ ctx[8][/*button*/ ctx[34]].text,
        );
    },
    d(detaching) {
      if (detaching) {
        detach(button_1);
      }

      mounted = false;
      run_all(dispose);
    },
  };
}

// (78:32)
function create_if_block_3(ctx) {
  let button_1;
  let t_value = /*$buttonText*/ ctx[7][/*button*/ ctx[34]] + "";
  let t;
  let button_1_class_value;
  let mounted;
  let dispose;

  return {
    c() {
      button_1 = element("button");
      t = text(t_value);
      attr(
        button_1,
        "class",
        (button_1_class_value =
          "" + /*$theme*/ (ctx[5].button + " ec-" + /*button*/ ctx[34])),
      );
      button_1.disabled = /*todayDisabled*/ ctx[1];
    },
    m(target, anchor) {
      insert(target, button_1, anchor);
      append(button_1, t);

      if (!mounted) {
        dispose = listen$1(button_1, "click", /*click_handler*/ ctx[28]);
        mounted = true;
      }
    },
    p(ctx, dirty) {
      if (
        dirty[0] & /*$buttonText, buttons*/ 129 &&
        t_value !== (t_value = /*$buttonText*/ ctx[7][/*button*/ ctx[34]] + "")
      )
        set_data(t, t_value);

      if (
        dirty[0] & /*$theme, buttons*/ 33 &&
        button_1_class_value !==
          (button_1_class_value =
            "" + /*$theme*/ (ctx[5].button + " ec-" + /*button*/ ctx[34]))
      ) {
        attr(button_1, "class", button_1_class_value);
      }

      if (dirty[0] & /*todayDisabled*/ 2) {
        button_1.disabled = /*todayDisabled*/ ctx[1];
      }
    },
    d(detaching) {
      if (detaching) {
        detach(button_1);
      }

      mounted = false;
      dispose();
    },
  };
}

// (70:31)
function create_if_block_2(ctx) {
  let button_1;
  let i;
  let i_class_value;
  let button_1_class_value;
  let button_1_aria_label_value;
  let button_1_title_value;
  let mounted;
  let dispose;

  return {
    c() {
      button_1 = element("button");
      i = element("i");
      attr(
        i,
        "class",
        (i_class_value =
          "" + /*$theme*/ (ctx[5].icon + " ec-" + /*button*/ ctx[34])),
      );
      attr(
        button_1,
        "class",
        (button_1_class_value =
          "" + /*$theme*/ (ctx[5].button + " ec-" + /*button*/ ctx[34])),
      );
      attr(
        button_1,
        "aria-label",
        (button_1_aria_label_value = /*$buttonText*/ ctx[7].next),
      );
      attr(
        button_1,
        "title",
        (button_1_title_value = /*$buttonText*/ ctx[7].next),
      );
      button_1.disabled = /*nextDisabled*/ ctx[4];
    },
    m(target, anchor) {
      insert(target, button_1, anchor);
      append(button_1, i);

      if (!mounted) {
        dispose = listen$1(button_1, "click", /*next*/ ctx[23]);
        mounted = true;
      }
    },
    p(ctx, dirty) {
      if (
        dirty[0] & /*$theme, buttons*/ 33 &&
        i_class_value !==
          (i_class_value =
            "" + /*$theme*/ (ctx[5].icon + " ec-" + /*button*/ ctx[34]))
      ) {
        attr(i, "class", i_class_value);
      }

      if (
        dirty[0] & /*$theme, buttons*/ 33 &&
        button_1_class_value !==
          (button_1_class_value =
            "" + /*$theme*/ (ctx[5].button + " ec-" + /*button*/ ctx[34]))
      ) {
        attr(button_1, "class", button_1_class_value);
      }

      if (
        dirty[0] & /*$buttonText*/ 128 &&
        button_1_aria_label_value !==
          (button_1_aria_label_value = /*$buttonText*/ ctx[7].next)
      ) {
        attr(button_1, "aria-label", button_1_aria_label_value);
      }

      if (
        dirty[0] & /*$buttonText*/ 128 &&
        button_1_title_value !==
          (button_1_title_value = /*$buttonText*/ ctx[7].next)
      ) {
        attr(button_1, "title", button_1_title_value);
      }

      if (dirty[0] & /*nextDisabled*/ 16) {
        button_1.disabled = /*nextDisabled*/ ctx[4];
      }
    },
    d(detaching) {
      if (detaching) {
        detach(button_1);
      }

      mounted = false;
      dispose();
    },
  };
}

// (62:31)
function create_if_block_1(ctx) {
  let button_1;
  let i;
  let i_class_value;
  let button_1_class_value;
  let button_1_aria_label_value;
  let button_1_title_value;
  let mounted;
  let dispose;

  return {
    c() {
      button_1 = element("button");
      i = element("i");
      attr(
        i,
        "class",
        (i_class_value =
          "" + /*$theme*/ (ctx[5].icon + " ec-" + /*button*/ ctx[34])),
      );
      attr(
        button_1,
        "class",
        (button_1_class_value =
          "" + /*$theme*/ (ctx[5].button + " ec-" + /*button*/ ctx[34])),
      );
      attr(
        button_1,
        "aria-label",
        (button_1_aria_label_value = /*$buttonText*/ ctx[7].prev),
      );
      attr(
        button_1,
        "title",
        (button_1_title_value = /*$buttonText*/ ctx[7].prev),
      );
      button_1.disabled = /*prevDisabled*/ ctx[3];
    },
    m(target, anchor) {
      insert(target, button_1, anchor);
      append(button_1, i);

      if (!mounted) {
        dispose = listen$1(button_1, "click", /*prev*/ ctx[22]);
        mounted = true;
      }
    },
    p(ctx, dirty) {
      if (
        dirty[0] & /*$theme, buttons*/ 33 &&
        i_class_value !==
          (i_class_value =
            "" + /*$theme*/ (ctx[5].icon + " ec-" + /*button*/ ctx[34]))
      ) {
        attr(i, "class", i_class_value);
      }

      if (
        dirty[0] & /*$theme, buttons*/ 33 &&
        button_1_class_value !==
          (button_1_class_value =
            "" + /*$theme*/ (ctx[5].button + " ec-" + /*button*/ ctx[34]))
      ) {
        attr(button_1, "class", button_1_class_value);
      }

      if (
        dirty[0] & /*$buttonText*/ 128 &&
        button_1_aria_label_value !==
          (button_1_aria_label_value = /*$buttonText*/ ctx[7].prev)
      ) {
        attr(button_1, "aria-label", button_1_aria_label_value);
      }

      if (
        dirty[0] & /*$buttonText*/ 128 &&
        button_1_title_value !==
          (button_1_title_value = /*$buttonText*/ ctx[7].prev)
      ) {
        attr(button_1, "title", button_1_title_value);
      }

      if (dirty[0] & /*prevDisabled*/ 8) {
        button_1.disabled = /*prevDisabled*/ ctx[3];
      }
    },
    d(detaching) {
      if (detaching) {
        detach(button_1);
      }

      mounted = false;
      dispose();
    },
  };
}

// (59:4) {#if button == 'title'}
function create_if_block$1(ctx) {
  let h2;
  let h2_class_value;
  let setContent_action;
  let mounted;
  let dispose;

  return {
    c() {
      h2 = element("h2");
      attr(h2, "class", (h2_class_value = /*$theme*/ ctx[5].title));
    },
    m(target, anchor) {
      insert(target, h2, anchor);

      if (!mounted) {
        dispose = action_destroyer(
          (setContent_action = setContent.call(
            null,
            h2,
            /*$_viewTitle*/ ctx[6],
          )),
        );
        mounted = true;
      }
    },
    p(ctx, dirty) {
      if (
        dirty[0] & /*$theme*/ 32 &&
        h2_class_value !== (h2_class_value = /*$theme*/ ctx[5].title)
      ) {
        attr(h2, "class", h2_class_value);
      }

      if (
        setContent_action &&
        is_function(setContent_action.update) &&
        dirty[0] & /*$_viewTitle*/ 64
      )
        setContent_action.update.call(null, /*$_viewTitle*/ ctx[6]);
    },
    d(detaching) {
      if (detaching) {
        detach(h2);
      }

      mounted = false;
      dispose();
    },
  };
}

// (58:0) {#each buttons as button}
function create_each_block$2(ctx) {
  let if_block_anchor;

  function select_block_type(ctx, dirty) {
    if (/*button*/ ctx[34] == "title") return create_if_block$1;
    if (/*button*/ ctx[34] == "prev") return create_if_block_1;
    if (/*button*/ ctx[34] == "next") return create_if_block_2;
    if (/*button*/ ctx[34] == "today") return create_if_block_3;
    if (/*$customButtons*/ ctx[8][/*button*/ ctx[34]]) return create_if_block_4;
    if (/*button*/ ctx[34] != "") return create_if_block_5;
  }

  let current_block_type = select_block_type(ctx);
  let if_block = current_block_type && current_block_type(ctx);

  return {
    c() {
      if (if_block) if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block) if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx, dirty) {
      if (
        current_block_type === (current_block_type = select_block_type(ctx)) &&
        if_block
      ) {
        if_block.p(ctx, dirty);
      } else {
        if (if_block) if_block.d(1);
        if_block = current_block_type && current_block_type(ctx);

        if (if_block) {
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      }
    },
    d(detaching) {
      if (detaching) {
        detach(if_block_anchor);
      }

      if (if_block) {
        if_block.d(detaching);
      }
    },
  };
}

function create_fragment$3(ctx) {
  let each_1_anchor;
  let each_value = ensure_array_like(/*buttons*/ ctx[0]);
  let each_blocks = [];

  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$2(
      get_each_context$2(ctx, each_value, i),
    );
  }

  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }

      each_1_anchor = empty();
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }

      insert(target, each_1_anchor, anchor);
    },
    p(ctx, dirty) {
      if (
        dirty[0] &
        /*$theme, $_viewTitle, buttons, $buttonText, prevDisabled, prev, nextDisabled, next, todayDisabled, $date, today, $customButtons, $view*/ 14681087
      ) {
        each_value = ensure_array_like(/*buttons*/ ctx[0]);
        let i;

        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$2(ctx, each_value, i);

          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$2(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }

        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }

        each_blocks.length = each_value.length;
      }
    },
    i: noop$1,
    o: noop$1,
    d(detaching) {
      if (detaching) {
        detach(each_1_anchor);
      }

      destroy_each(each_blocks, detaching);
    },
  };
}

function instance$3($$self, $$props, $$invalidate) {
  let $duration;
  let $date;
  let $hiddenDays;
  let $validRange;
  let $_viewDates;
  let $_currentRange;
  let $theme;
  let $_viewTitle;
  let $buttonText;
  let $customButtons;
  let $view;
  let { buttons } = $$props;
  let {
    _currentRange,
    _viewTitle,
    _viewDates,
    buttonText,
    customButtons,
    date,
    duration,
    hiddenDays,
    theme,
    validRange,
    view,
  } = getContext("state");
  component_subscribe($$self, _currentRange, (value) =>
    $$invalidate(27, ($_currentRange = value)),
  );
  component_subscribe($$self, _viewTitle, (value) =>
    $$invalidate(6, ($_viewTitle = value)),
  );
  component_subscribe($$self, _viewDates, (value) =>
    $$invalidate(31, ($_viewDates = value)),
  );
  component_subscribe($$self, buttonText, (value) =>
    $$invalidate(7, ($buttonText = value)),
  );
  component_subscribe($$self, customButtons, (value) =>
    $$invalidate(8, ($customButtons = value)),
  );
  component_subscribe($$self, date, (value) =>
    $$invalidate(2, ($date = value)),
  );
  component_subscribe($$self, duration, (value) =>
    $$invalidate(24, ($duration = value)),
  );
  component_subscribe($$self, hiddenDays, (value) =>
    $$invalidate(25, ($hiddenDays = value)),
  );
  component_subscribe($$self, theme, (value) =>
    $$invalidate(5, ($theme = value)),
  );
  component_subscribe($$self, validRange, (value) =>
    $$invalidate(26, ($validRange = value)),
  );
  component_subscribe($$self, view, (value) =>
    $$invalidate(9, ($view = value)),
  );
  let today = setMidnight(createDate());
  let prevDisabled, nextDisabled, todayDisabled;
  let running = false;

  function isRunning() {
    return running;
  }

  function test() {
    return $_viewDates.every((date) => outsideRange(date, $validRange));
  }

  function prev() {
    set_store_value(
      date,
      ($date = prevDate($date, $duration, $hiddenDays)),
      $date,
    );
  }

  function next() {
    set_store_value(date, ($date = nextDate($date, $duration)), $date);
  }

  const click_handler = () =>
    set_store_value(date, ($date = cloneDate(today)), $date);
  const click_handler_1 = (button) =>
    set_store_value(view, ($view = button), $view);

  $$self.$$set = ($$props) => {
    if ("buttons" in $$props) $$invalidate(0, (buttons = $$props.buttons));
  };

  $$self.$$.update = () => {
    if (
      $$self.$$.dirty[0] &
      /*$validRange, $date, $duration, $hiddenDays, $_currentRange, todayDisabled*/ 251658246
    ) {
      if (!isRunning()) {
        running = true;
        $$invalidate(3, (prevDisabled = false));
        $$invalidate(4, (nextDisabled = false));

        if ($validRange.start) {
          let currentDate = cloneDate($date);
          set_store_value(
            date,
            ($date = prevDate($date, $duration, $hiddenDays)),
            $date,
          );
          $$invalidate(3, (prevDisabled = test()));
          set_store_value(date, ($date = currentDate), $date);
        }

        if ($validRange.end) {
          let currentDate = cloneDate($date);
          set_store_value(date, ($date = nextDate($date, $duration)), $date);
          $$invalidate(4, (nextDisabled = test()));
          set_store_value(date, ($date = currentDate), $date);
        }

        $$invalidate(
          1,
          (todayDisabled =
            today >= $_currentRange.start && today < $_currentRange.end),
        );

        if (!todayDisabled && ($validRange.start || $validRange.end)) {
          let currentDate = cloneDate($date);
          set_store_value(date, ($date = cloneDate(today)), $date);
          $$invalidate(1, (todayDisabled = test()));
          set_store_value(date, ($date = currentDate), $date);
        }

        tick().then(() => (running = false));
      }
    }
  };

  return [
    buttons,
    todayDisabled,
    $date,
    prevDisabled,
    nextDisabled,
    $theme,
    $_viewTitle,
    $buttonText,
    $customButtons,
    $view,
    _currentRange,
    _viewTitle,
    _viewDates,
    buttonText,
    customButtons,
    date,
    duration,
    hiddenDays,
    theme,
    validRange,
    view,
    today,
    prev,
    next,
    $duration,
    $hiddenDays,
    $validRange,
    $_currentRange,
    click_handler,
    click_handler_1,
  ];
}

class Buttons extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$3,
      create_fragment$3,
      safe_not_equal,
      { buttons: 0 },
      null,
      [-1, -1],
    );
  }
}

/* packages/core/src/Toolbar.svelte generated by Svelte v4.2.19 */

function get_each_context$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[5] = list[i];
  return child_ctx;
}

function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[8] = list[i];
  return child_ctx;
}

// (29:16) {:else}
function create_else_block(ctx) {
  let buttons_1;
  let current;
  buttons_1 = new Buttons({ props: { buttons: /*buttons*/ ctx[8] } });

  return {
    c() {
      create_component(buttons_1.$$.fragment);
    },
    m(target, anchor) {
      mount_component(buttons_1, target, anchor);
      current = true;
    },
    p(ctx, dirty) {
      const buttons_1_changes = {};
      if (dirty & /*sections*/ 1)
        buttons_1_changes.buttons = /*buttons*/ ctx[8];
      buttons_1.$set(buttons_1_changes);
    },
    i(local) {
      if (current) return;
      transition_in(buttons_1.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(buttons_1.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(buttons_1, detaching);
    },
  };
}

// (25:16) {#if buttons.length > 1}
function create_if_block(ctx) {
  let div;
  let buttons_1;
  let div_class_value;
  let current;
  buttons_1 = new Buttons({ props: { buttons: /*buttons*/ ctx[8] } });

  return {
    c() {
      div = element("div");
      create_component(buttons_1.$$.fragment);
      attr(div, "class", (div_class_value = /*$theme*/ ctx[1].buttonGroup));
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(buttons_1, div, null);
      current = true;
    },
    p(ctx, dirty) {
      const buttons_1_changes = {};
      if (dirty & /*sections*/ 1)
        buttons_1_changes.buttons = /*buttons*/ ctx[8];
      buttons_1.$set(buttons_1_changes);

      if (
        !current ||
        (dirty & /*$theme*/ 2 &&
          div_class_value !== (div_class_value = /*$theme*/ ctx[1].buttonGroup))
      ) {
        attr(div, "class", div_class_value);
      }
    },
    i(local) {
      if (current) return;
      transition_in(buttons_1.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(buttons_1.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }

      destroy_component(buttons_1);
    },
  };
}

// (24:12) {#each sections[key] as buttons}
function create_each_block_1(ctx) {
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block, create_else_block];
  const if_blocks = [];

  function select_block_type(ctx, dirty) {
    if (/*buttons*/ ctx[8].length > 1) return 0;
    return 1;
  }

  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] =
    if_block_creators[current_block_type_index](ctx);

  return {
    c() {
      if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if_blocks[current_block_type_index].m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx, dirty) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx);

      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx, dirty);
      } else {
        group_outros();

        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });

        check_outros();
        if_block = if_blocks[current_block_type_index];

        if (!if_block) {
          if_block = if_blocks[current_block_type_index] =
            if_block_creators[current_block_type_index](ctx);
          if_block.c();
        } else {
          if_block.p(ctx, dirty);
        }

        transition_in(if_block, 1);
        if_block.m(if_block_anchor.parentNode, if_block_anchor);
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(if_block_anchor);
      }

      if_blocks[current_block_type_index].d(detaching);
    },
  };
}

// (22:4) {#each keys(sections) as key}
function create_each_block$1(ctx) {
  let div;
  let t;
  let div_class_value;
  let current;
  let each_value_1 = ensure_array_like(/*sections*/ ctx[0][/*key*/ ctx[5]]);
  let each_blocks = [];

  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_1(
      get_each_context_1(ctx, each_value_1, i),
    );
  }

  const out = (i) =>
    transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });

  return {
    c() {
      div = element("div");

      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }

      t = space();
      attr(div, "class", (div_class_value = "ec-" + /*key*/ ctx[5]));
    },
    m(target, anchor) {
      insert(target, div, anchor);

      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div, null);
        }
      }

      append(div, t);
      current = true;
    },
    p(ctx, dirty) {
      if (dirty & /*$theme, sections*/ 3) {
        each_value_1 = ensure_array_like(/*sections*/ ctx[0][/*key*/ ctx[5]]);
        let i;

        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1(ctx, each_value_1, i);

          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block_1(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(div, t);
          }
        }

        group_outros();

        for (i = each_value_1.length; i < each_blocks.length; i += 1) {
          out(i);
        }

        check_outros();
      }

      if (
        !current ||
        (dirty & /*sections*/ 1 &&
          div_class_value !== (div_class_value = "ec-" + /*key*/ ctx[5]))
      ) {
        attr(div, "class", div_class_value);
      }
    },
    i(local) {
      if (current) return;

      for (let i = 0; i < each_value_1.length; i += 1) {
        transition_in(each_blocks[i]);
      }

      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean);

      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }

      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }

      destroy_each(each_blocks, detaching);
    },
  };
}

function create_fragment$2(ctx) {
  let nav;
  let nav_class_value;
  let current;
  let each_value = ensure_array_like(keys(/*sections*/ ctx[0]));
  let each_blocks = [];

  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$1(
      get_each_context$1(ctx, each_value, i),
    );
  }

  const out = (i) =>
    transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });

  return {
    c() {
      nav = element("nav");

      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }

      attr(nav, "class", (nav_class_value = /*$theme*/ ctx[1].toolbar));
    },
    m(target, anchor) {
      insert(target, nav, anchor);

      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(nav, null);
        }
      }

      current = true;
    },
    p(ctx, [dirty]) {
      if (dirty & /*sections, $theme*/ 3) {
        each_value = ensure_array_like(keys(/*sections*/ ctx[0]));
        let i;

        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$1(ctx, each_value, i);

          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block$1(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(nav, null);
          }
        }

        group_outros();

        for (i = each_value.length; i < each_blocks.length; i += 1) {
          out(i);
        }

        check_outros();
      }

      if (
        !current ||
        (dirty & /*$theme*/ 2 &&
          nav_class_value !== (nav_class_value = /*$theme*/ ctx[1].toolbar))
      ) {
        attr(nav, "class", nav_class_value);
      }
    },
    i(local) {
      if (current) return;

      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }

      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean);

      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }

      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(nav);
      }

      destroy_each(each_blocks, detaching);
    },
  };
}

function instance$2($$self, $$props, $$invalidate) {
  let $headerToolbar;
  let $theme;
  let { headerToolbar, theme } = getContext("state");
  component_subscribe($$self, headerToolbar, (value) =>
    $$invalidate(4, ($headerToolbar = value)),
  );
  component_subscribe($$self, theme, (value) =>
    $$invalidate(1, ($theme = value)),
  );
  let sections = { start: [], center: [], end: [] };

  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*sections, $headerToolbar*/ 17) {
      {
        for (let key of keys(sections)) {
          $$invalidate(
            0,
            (sections[key] = $headerToolbar[key]
              .split(" ")
              .map((group) => group.split(","))),
            sections,
          );
        }
      }
    }
  };

  return [sections, $theme, headerToolbar, theme, $headerToolbar];
}

class Toolbar extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$2, create_fragment$2, safe_not_equal, {});
  }
}

/* packages/core/src/Auxiliary.svelte generated by Svelte v4.2.19 */

function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[11] = list[i];
  return child_ctx;
}

// (24:0) {#each $_auxiliary as component}
function create_each_block(ctx) {
  let switch_instance;
  let switch_instance_anchor;
  let current;
  var switch_value = /*component*/ ctx[11];

  function switch_props(ctx, dirty) {
    return {};
  }

  if (switch_value) {
    switch_instance = construct_svelte_component(switch_value, switch_props());
  }

  return {
    c() {
      if (switch_instance) create_component(switch_instance.$$.fragment);
      switch_instance_anchor = empty();
    },
    m(target, anchor) {
      if (switch_instance) mount_component(switch_instance, target, anchor);
      insert(target, switch_instance_anchor, anchor);
      current = true;
    },
    p(ctx, dirty) {
      if (
        dirty & /*$_auxiliary*/ 1 &&
        switch_value !== (switch_value = /*component*/ ctx[11])
      ) {
        if (switch_instance) {
          group_outros();
          const old_component = switch_instance;

          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });

          check_outros();
        }

        if (switch_value) {
          switch_instance = construct_svelte_component(
            switch_value,
            switch_props(),
          );
          create_component(switch_instance.$$.fragment);
          transition_in(switch_instance.$$.fragment, 1);
          mount_component(
            switch_instance,
            switch_instance_anchor.parentNode,
            switch_instance_anchor,
          );
        } else {
          switch_instance = null;
        }
      }
    },
    i(local) {
      if (current) return;
      if (switch_instance) transition_in(switch_instance.$$.fragment, local);
      current = true;
    },
    o(local) {
      if (switch_instance) transition_out(switch_instance.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(switch_instance_anchor);
      }

      if (switch_instance) destroy_component(switch_instance, detaching);
    },
  };
}

function create_fragment$1(ctx) {
  let each_1_anchor;
  let current;
  let each_value = ensure_array_like(/*$_auxiliary*/ ctx[0]);
  let each_blocks = [];

  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }

  const out = (i) =>
    transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });

  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }

      each_1_anchor = empty();
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }

      insert(target, each_1_anchor, anchor);
      current = true;
    },
    p(ctx, [dirty]) {
      if (dirty & /*$_auxiliary*/ 1) {
        each_value = ensure_array_like(/*$_auxiliary*/ ctx[0]);
        let i;

        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx, each_value, i);

          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }

        group_outros();

        for (i = each_value.length; i < each_blocks.length; i += 1) {
          out(i);
        }

        check_outros();
      }
    },
    i(local) {
      if (current) return;

      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }

      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean);

      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }

      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(each_1_anchor);
      }

      destroy_each(each_blocks, detaching);
    },
  };
}

function instance$1($$self, $$props, $$invalidate) {
  let $_view;
  let $datesSet;
  let $_activeRange;
  let $_auxiliary;
  let { datesSet, _auxiliary, _activeRange, _queue, _view } =
    getContext("state");
  component_subscribe($$self, datesSet, (value) =>
    $$invalidate(7, ($datesSet = value)),
  );
  component_subscribe($$self, _auxiliary, (value) =>
    $$invalidate(0, ($_auxiliary = value)),
  );
  component_subscribe($$self, _activeRange, (value) =>
    $$invalidate(5, ($_activeRange = value)),
  );
  component_subscribe($$self, _view, (value) =>
    $$invalidate(6, ($_view = value)),
  );
  let debounceHandle = {};

  function runDatesSet(_activeRange) {
    if (isFunction($datesSet)) {
      debounce(
        () =>
          $datesSet({
            start: toLocalDate(_activeRange.start),
            end: toLocalDate(_activeRange.end),
            startStr: toISOString(_activeRange.start),
            endStr: toISOString(_activeRange.end),
            view: toViewWithLocalDates($_view),
          }),
        debounceHandle,
        _queue,
      );
    }
  }

  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$_activeRange*/ 32) {
      // Set up datesSet callback
      runDatesSet($_activeRange);
    }
  };

  return [
    $_auxiliary,
    datesSet,
    _auxiliary,
    _activeRange,
    _view,
    $_activeRange,
  ];
}

class Auxiliary extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
  }
}

/* packages/core/src/Calendar.svelte generated by Svelte v4.2.19 */

function create_fragment(ctx) {
  let div;
  let toolbar;
  let t0;
  let switch_instance;
  let div_class_value;
  let div_role_value;
  let t1;
  let auxiliary;
  let current;
  let mounted;
  let dispose;
  toolbar = new Toolbar({});
  var switch_value = /*$_viewComponent*/ ctx[5];

  function switch_props(ctx, dirty) {
    return {};
  }

  if (switch_value) {
    switch_instance = construct_svelte_component(switch_value, switch_props());
  }

  auxiliary = new Auxiliary({});

  return {
    c() {
      div = element("div");
      create_component(toolbar.$$.fragment);
      t0 = space();
      if (switch_instance) create_component(switch_instance.$$.fragment);
      t1 = space();
      create_component(auxiliary.$$.fragment);

      attr(
        div,
        "class",
        (div_class_value =
          "" +
          /*$theme*/ (ctx[1].calendar +
            " " +
            /*$theme*/ ctx[1].view +
            /*$_scrollable*/ (ctx[0]
              ? " " + /*$theme*/ ctx[1].withScroll
              : "") +
            /*$_iClass*/ (ctx[2]
              ? " " + /*$theme*/ ctx[1][/*$_iClass*/ ctx[2]]
              : ""))),
      );

      attr(
        div,
        "role",
        (div_role_value = listView(/*$view*/ ctx[4]) ? "list" : "table"),
      );
      set_style(div, "height", /*$height*/ ctx[3]);
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(toolbar, div, null);
      append(div, t0);
      if (switch_instance) mount_component(switch_instance, div, null);
      insert(target, t1, anchor);
      mount_component(auxiliary, target, anchor);
      current = true;

      if (!mounted) {
        dispose = listen$1(window, "resize", /*recheckScrollable*/ ctx[20]);
        mounted = true;
      }
    },
    p(ctx, dirty) {
      if (
        dirty[0] & /*$_viewComponent*/ 32 &&
        switch_value !== (switch_value = /*$_viewComponent*/ ctx[5])
      ) {
        if (switch_instance) {
          group_outros();
          const old_component = switch_instance;

          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });

          check_outros();
        }

        if (switch_value) {
          switch_instance = construct_svelte_component(
            switch_value,
            switch_props(),
          );
          create_component(switch_instance.$$.fragment);
          transition_in(switch_instance.$$.fragment, 1);
          mount_component(switch_instance, div, null);
        } else {
          switch_instance = null;
        }
      }

      if (
        !current ||
        (dirty[0] & /*$theme, $_scrollable, $_iClass*/ 7 &&
          div_class_value !==
            (div_class_value =
              "" +
              /*$theme*/ (ctx[1].calendar +
                " " +
                /*$theme*/ ctx[1].view +
                /*$_scrollable*/ (ctx[0]
                  ? " " + /*$theme*/ ctx[1].withScroll
                  : "") +
                /*$_iClass*/ (ctx[2]
                  ? " " + /*$theme*/ ctx[1][/*$_iClass*/ ctx[2]]
                  : ""))))
      ) {
        attr(div, "class", div_class_value);
      }

      if (
        !current ||
        (dirty[0] & /*$view*/ 16 &&
          div_role_value !==
            (div_role_value = listView(/*$view*/ ctx[4]) ? "list" : "table"))
      ) {
        attr(div, "role", div_role_value);
      }

      if (dirty[0] & /*$height*/ 8) {
        set_style(div, "height", /*$height*/ ctx[3]);
      }
    },
    i(local) {
      if (current) return;
      transition_in(toolbar.$$.fragment, local);
      if (switch_instance) transition_in(switch_instance.$$.fragment, local);
      transition_in(auxiliary.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(toolbar.$$.fragment, local);
      if (switch_instance) transition_out(switch_instance.$$.fragment, local);
      transition_out(auxiliary.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div);
        detach(t1);
      }

      destroy_component(toolbar);
      if (switch_instance) destroy_component(switch_instance);
      destroy_component(auxiliary, detaching);
      mounted = false;
      dispose();
    },
  };
}

function instance($$self, $$props, $$invalidate) {
  let $_bodyEl;
  let $_scrollable;
  let $_queue2;
  let $_queue;
  let $hiddenDays;
  let $duration;
  let $date;
  let $_interaction;
  let $_events;
  let $theme;
  let $_iClass;
  let $height;
  let $view;
  let $_viewComponent;
  let { plugins = [] } = $$props;
  let { options = {} } = $$props;
  let state = new State(plugins, options);
  setContext("state", state);
  let {
    _viewComponent,
    _bodyEl,
    _interaction,
    _iClass,
    _events,
    _queue,
    _queue2,
    _tasks,
    _scrollable,
    date,
    duration,
    hiddenDays,
    height,
    theme,
    view,
  } = state;
  component_subscribe($$self, _viewComponent, (value) =>
    $$invalidate(5, ($_viewComponent = value)),
  );
  component_subscribe($$self, _bodyEl, (value) =>
    $$invalidate(36, ($_bodyEl = value)),
  );
  component_subscribe($$self, _interaction, (value) =>
    $$invalidate(42, ($_interaction = value)),
  );
  component_subscribe($$self, _iClass, (value) =>
    $$invalidate(2, ($_iClass = value)),
  );
  component_subscribe($$self, _events, (value) =>
    $$invalidate(43, ($_events = value)),
  );
  component_subscribe($$self, _queue, (value) =>
    $$invalidate(38, ($_queue = value)),
  );
  component_subscribe($$self, _queue2, (value) =>
    $$invalidate(37, ($_queue2 = value)),
  );
  component_subscribe($$self, _scrollable, (value) =>
    $$invalidate(0, ($_scrollable = value)),
  );
  component_subscribe($$self, date, (value) =>
    $$invalidate(41, ($date = value)),
  );
  component_subscribe($$self, duration, (value) =>
    $$invalidate(40, ($duration = value)),
  );
  component_subscribe($$self, hiddenDays, (value) =>
    $$invalidate(39, ($hiddenDays = value)),
  );
  component_subscribe($$self, height, (value) =>
    $$invalidate(3, ($height = value)),
  );
  component_subscribe($$self, theme, (value) =>
    $$invalidate(1, ($theme = value)),
  );
  component_subscribe($$self, view, (value) =>
    $$invalidate(4, ($view = value)),
  );

  // Reactively update options that did change
  let prevOptions = { ...options };

  function setOption(name, value) {
    state._set(name, value);
    return this;
  }

  function getOption(name) {
    let value = state._get(name);
    return value instanceof Date ? toLocalDate(value) : value;
  }

  function refetchEvents() {
    state._fetchedRange.set({ start: undefined, end: undefined });
    return this;
  }

  function getEvents() {
    return $_events.map(toEventWithLocalDates);
  }

  function getEventById(id) {
    for (let event of $_events) {
      if (event.id == id) {
        return toEventWithLocalDates(event);
      }
    }

    return null;
  }

  function addEvent(event) {
    event = createEvents([event])[0];
    $_events.push(event);
    _events.set($_events);
    return toEventWithLocalDates(event);
  }

  function updateEvent(event) {
    for (let e of $_events) {
      if (e.id == event.id) {
        event = createEvents([event])[0];
        assign(e, event);
        _events.set($_events);
        return toEventWithLocalDates(event);
      }
    }

    return null;
  }

  function removeEventById(id) {
    let idx = $_events.findIndex((event) => event.id == id);

    if (idx >= 0) {
      $_events.splice(idx, 1);
      _events.set($_events);
    }

    return this;
  }

  function getView() {
    return toViewWithLocalDates(get(state._view));
  }

  function unselect() {
    $_interaction.action?.unselect();
    return this;
  }

  function dateFromPoint(x, y) {
    let dayEl = getElementWithPayload(x, y);

    if (dayEl) {
      let info = getPayload(dayEl)(x, y);
      info.date = toLocalDate(info.date);
      return info;
    }

    return null;
  }

  function next() {
    set_store_value(date, ($date = nextDate($date, $duration)), $date);
    return this;
  }

  function prev() {
    set_store_value(
      date,
      ($date = prevDate($date, $duration, $hiddenDays)),
      $date,
    );
    return this;
  }

  //beforeUpdate(() => {
  $effect.pre(() => {
    flushDebounce($_queue);
  });

  //afterUpdate(() => {
  $effect(() => {
    flushDebounce($_queue2);
    task(recheckScrollable, null, _tasks);
  });

  function recheckScrollable() {
    if ($_bodyEl) {
      set_store_value(
        _scrollable,
        ($_scrollable = hasYScroll($_bodyEl)),
        $_scrollable,
      );
    }
  }

  $$self.$$set = ($$props) => {
    if ("plugins" in $$props) $$invalidate(21, (plugins = $$props.plugins));
    if ("options" in $$props) $$invalidate(22, (options = $$props.options));
  };

  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*options*/ 4194304) {
      for (let [name, value] of diff(options, prevOptions)) {
        setOption(name, value);
      }
    }
  };

  return [
    $_scrollable,
    $theme,
    $_iClass,
    $height,
    $view,
    $_viewComponent,
    _viewComponent,
    _bodyEl,
    _interaction,
    _iClass,
    _events,
    _queue,
    _queue2,
    _scrollable,
    date,
    duration,
    hiddenDays,
    height,
    theme,
    view,
    recheckScrollable,
    plugins,
    options,
    setOption,
    getOption,
    refetchEvents,
    getEvents,
    getEventById,
    addEvent,
    updateEvent,
    removeEventById,
    getView,
    unselect,
    dateFromPoint,
    next,
    prev,
  ];
}

class Calendar extends SvelteComponent {
  constructor(options) {
    super();

    init(
      this,
      options,
      instance,
      create_fragment,
      safe_not_equal,
      {
        plugins: 21,
        options: 22,
        setOption: 23,
        getOption: 24,
        refetchEvents: 25,
        getEvents: 26,
        getEventById: 27,
        addEvent: 28,
        updateEvent: 29,
        removeEventById: 30,
        getView: 31,
        unselect: 32,
        dateFromPoint: 33,
        next: 34,
        prev: 35,
      },
      null,
      [-1, -1],
    );
  }

  get setOption() {
    return this.$$.ctx[23];
  }

  get getOption() {
    return this.$$.ctx[24];
  }

  get refetchEvents() {
    return this.$$.ctx[25];
  }

  get getEvents() {
    return this.$$.ctx[26];
  }

  get getEventById() {
    return this.$$.ctx[27];
  }

  get addEvent() {
    return this.$$.ctx[28];
  }

  get updateEvent() {
    return this.$$.ctx[29];
  }

  get removeEventById() {
    return this.$$.ctx[30];
  }

  get getView() {
    return this.$$.ctx[31];
  }

  get unselect() {
    return this.$$.ctx[32];
  }

  get dateFromPoint() {
    return this.$$.ctx[33];
  }

  get next() {
    return this.$$.ctx[34];
  }

  get prev() {
    return this.$$.ctx[35];
  }
}

class index extends Calendar {
  destroy() {
    this.$destroy();
  }

  get view() {
    return this.getView();
  }
}

export {
  DAY_IN_SECONDS,
  addDay,
  addDuration,
  ancestor,
  assign,
  bgEvent,
  btnTextDay,
  btnTextMonth,
  btnTextWeek,
  btnTextYear,
  ceil,
  cloneDate,
  cloneEvent,
  copyTime,
  createDate,
  createDateRange,
  createDuration,
  createElement,
  createEventChunk,
  createEventClasses,
  createEventContent,
  createEventSources,
  createEvents,
  createResource,
  createResources,
  createSlotTimeLimits,
  createTimes,
  createView,
  datesEqual,
  debounce,
  index as default,
  eventIntersects,
  floor,
  flushDebounce,
  getElementWithPayload,
  getPayload,
  getWeekNumber,
  ghostEvent,
  hasPayload,
  hasYScroll,
  height,
  helperEvent,
  identity,
  intl,
  intlRange,
  isArray,
  isFunction,
  keyEnter,
  keys,
  limitToRange,
  listView,
  listen,
  max,
  min,
  nextClosestDay,
  nextDate,
  noTimePart,
  noop,
  outsideEvent,
  outsideRange,
  pointerEvent,
  prepareEventChunks,
  prevClosestDay,
  prevDate,
  previewEvent,
  rect,
  repositionEvent,
  resourceBackgroundColor,
  resourceTextColor,
  run,
  runAll,
  runReposition,
  setContent,
  setMidnight,
  setPayload,
  sortEventChunks,
  subtractDay,
  subtractDuration,
  symbol,
  task,
  themeView,
  timelineView,
  toEventWithLocalDates,
  toISOString,
  toLocalDate,
  toSeconds,
  toViewWithLocalDates,
  viewResources,
};
