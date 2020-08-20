
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const messages = writable([]);

    /* src/components/NotifItem.svelte generated by Svelte v3.24.0 */
    const file = "src/components/NotifItem.svelte";

    function add_css() {
    	var style = element("style");
    	style.id = "svelte-1ncmgbl-style";
    	style.textContent = ".wui-notif-item.svelte-1ncmgbl{background-color:white;border:1px solid black;box-shadow:3px 3px;padding:1em;margin-bottom:1em}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm90aWZJdGVtLnN2ZWx0ZSIsInNvdXJjZXMiOlsiTm90aWZJdGVtLnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxuXHRpbXBvcnQgeyBvbk1vdW50IH0gZnJvbSAnc3ZlbHRlJztcblx0aW1wb3J0IHsgZmFkZSB9IGZyb20gJ3N2ZWx0ZS90cmFuc2l0aW9uJztcblx0aW1wb3J0IHsgbWVzc2FnZXMgfSBmcm9tIFwiLi9Ob3RpZi5zdG9yZS5qc1wiXG5cblx0ZXhwb3J0IGxldCB0ZXh0ID0gXCJcIjtcblxuXHRvbk1vdW50KCgpID0+IHtcblx0XHRsZXQgdGltZXJJRCA9IHNldFRpbWVvdXQoKCk9PiB7XG5cdFx0XHRtZXNzYWdlcy51cGRhdGUobXNncyA9PiB7XG5cdFx0XHRcdG1zZ3Muc3BsaWNlKDAsIDEpO1xuXHRcdFx0XHRyZXR1cm4gbXNnc1xuXHRcdFx0fSlcblx0XHR9LCA1MDAwKVxuXHR9KVxuPC9zY3JpcHQ+XG5cbjxzdHlsZT5cblx0Lnd1aS1ub3RpZi1pdGVtIHtcblx0XHRiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTtcblx0XHRib3JkZXI6IDFweCBzb2xpZCBibGFjaztcblx0XHRib3gtc2hhZG93OiAzcHggM3B4O1xuXHRcdHBhZGRpbmc6IDFlbTtcblx0XHRtYXJnaW4tYm90dG9tOiAxZW07XG5cdH1cbjwvc3R5bGU+XG5cbjxkaXYgdHJhbnNpdGlvbjpmYWRlIGNsYXNzPVwid3VpLW5vdGlmLWl0ZW1cIj5cblx0e3RleHR9XG48L2Rpdj5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFrQkMsZUFBZSxlQUFDLENBQUMsQUFDaEIsZ0JBQWdCLENBQUUsS0FBSyxDQUN2QixNQUFNLENBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQ3ZCLFVBQVUsQ0FBRSxHQUFHLENBQUMsR0FBRyxDQUNuQixPQUFPLENBQUUsR0FBRyxDQUNaLGFBQWEsQ0FBRSxHQUFHLEFBQ25CLENBQUMifQ== */";
    	append_dev(document.head, style);
    }

    function create_fragment(ctx) {
    	let div;
    	let t;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*text*/ ctx[0]);
    			attr_dev(div, "class", "wui-notif-item svelte-1ncmgbl");
    			add_location(div, file, 27, 0, 463);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*text*/ 1) set_data_dev(t, /*text*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { text = "" } = $$props;

    	onMount(() => {
    		let timerID = setTimeout(
    			() => {
    				messages.update(msgs => {
    					msgs.splice(0, 1);
    					return msgs;
    				});
    			},
    			5000
    		);
    	});

    	const writable_props = ["text"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<NotifItem> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("NotifItem", $$slots, []);

    	$$self.$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({ onMount, fade, messages, text });

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text];
    }

    class NotifItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1ncmgbl-style")) add_css();
    		init(this, options, instance, create_fragment, safe_not_equal, { text: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotifItem",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get text() {
    		throw new Error("<NotifItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<NotifItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Notif.svelte generated by Svelte v3.24.0 */
    const file$1 = "src/components/Notif.svelte";

    function add_css$1() {
    	var style = element("style");
    	style.id = "svelte-cek1s7-style";
    	style.textContent = ".wui-notif.svelte-cek1s7{position:absolute;top:5px;left:calc((100% - 400px)/2);width:400px;border:1px solid red}@media(max-width: 500px){.wui-notif.svelte-cek1s7{left:1em;width:calc(100% - 2em)}}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm90aWYuc3ZlbHRlIiwic291cmNlcyI6WyJOb3RpZi5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdCBjb250ZXh0PVwibW9kdWxlXCI+XG5cdGltcG9ydCB7IG1lc3NhZ2VzIH0gZnJvbSBcIi4vTm90aWYuc3RvcmUuanNcIlxuXHRpbXBvcnQgTm90aWZJdGVtIGZyb20gXCIuL05vdGlmSXRlbS5zdmVsdGVcIlxuXG5cdGV4cG9ydCBmdW5jdGlvbiBXdWlQdXNoTm90aWYobXNnKSB7XG5cdFx0bWVzc2FnZXMudXBkYXRlKG1zZ3MgPT4gbXNncyA9IFsuLi5tc2dzLCBtc2ddKVxuXHR9XG48L3NjcmlwdD5cblxuPHN0eWxlPlxuXHQud3VpLW5vdGlmIHtcblx0XHRwb3NpdGlvbjogYWJzb2x1dGU7XG5cdFx0dG9wOiA1cHg7XG5cdFx0bGVmdDogY2FsYygoMTAwJSAtIDQwMHB4KS8yKTtcblx0XHR3aWR0aDogNDAwcHg7XG5cdFx0Ym9yZGVyOiAxcHggc29saWQgcmVkO1xuXHR9XG5cdEBtZWRpYSAobWF4LXdpZHRoOiA1MDBweCkge1xuXHRcdC53dWktbm90aWYge1xuXHRcdFx0bGVmdDogMWVtO1xuXHRcdFx0d2lkdGg6IGNhbGMoMTAwJSAtIDJlbSk7XG5cdFx0fVxuXHR9XG48L3N0eWxlPlxuXG48ZGl2IGNsYXNzPVwid3VpLW5vdGlmXCI+XG5cdHsjZWFjaCAkbWVzc2FnZXMgYXMgbXNnfVxuXHQ8Tm90aWZJdGVtIHRleHQ9e21zZ30vPlxuXHR7L2VhY2h9XG48L2Rpdj5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFVQyxVQUFVLGNBQUMsQ0FBQyxBQUNYLFFBQVEsQ0FBRSxRQUFRLENBQ2xCLEdBQUcsQ0FBRSxHQUFHLENBQ1IsSUFBSSxDQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUM1QixLQUFLLENBQUUsS0FBSyxDQUNaLE1BQU0sQ0FBRSxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQUFDdEIsQ0FBQyxBQUNELE1BQU0sQUFBQyxZQUFZLEtBQUssQ0FBQyxBQUFDLENBQUMsQUFDMUIsVUFBVSxjQUFDLENBQUMsQUFDWCxJQUFJLENBQUUsR0FBRyxDQUNULEtBQUssQ0FBRSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEFBQ3hCLENBQUMsQUFDRixDQUFDIn0= */";
    	append_dev(document.head, style);
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (27:1) {#each $messages as msg}
    function create_each_block(ctx) {
    	let notifitem;
    	let current;

    	notifitem = new NotifItem({
    			props: { text: /*msg*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(notifitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(notifitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const notifitem_changes = {};
    			if (dirty & /*$messages*/ 1) notifitem_changes.text = /*msg*/ ctx[1];
    			notifitem.$set(notifitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notifitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notifitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(notifitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(27:1) {#each $messages as msg}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let current;
    	let each_value = /*$messages*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "wui-notif svelte-cek1s7");
    			add_location(div, file$1, 25, 0, 451);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$messages*/ 1) {
    				each_value = /*$messages*/ ctx[0];
    				validate_each_argument(each_value);
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
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function WuiPushNotif(msg) {
    	messages.update(msgs => msgs = [...msgs, msg]);
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $messages;
    	validate_store(messages, "messages");
    	component_subscribe($$self, messages, $$value => $$invalidate(0, $messages = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Notif> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Notif", $$slots, []);

    	$$self.$capture_state = () => ({
    		messages,
    		NotifItem,
    		WuiPushNotif,
    		$messages
    	});

    	return [$messages];
    }

    class Notif extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-cek1s7-style")) add_css$1();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notif",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/components/InputIPPort.svelte generated by Svelte v3.24.0 */

    const file$2 = "src/components/InputIPPort.svelte";

    function add_css$2() {
    	var style = element("style");
    	style.id = "svelte-sy39ke-style";
    	style.textContent = ".wui-input-ipport.svelte-sy39ke.svelte-sy39ke{display:inline-block;width:100%}.wui-input-ipport.svelte-sy39ke input.svelte-sy39ke{width:100%}.invalid.svelte-sy39ke.svelte-sy39ke{color:red}div.invalid.svelte-sy39ke.svelte-sy39ke{font-size:12px}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5wdXRJUFBvcnQuc3ZlbHRlIiwic291cmNlcyI6WyJJbnB1dElQUG9ydC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cblx0ZXhwb3J0IGxldCB2YWx1ZSA9IFwiXCI7XG5cdGxldCBpc0ludmFsaWQgPSBmYWxzZTtcblx0bGV0IGVycm9yID0gXCJcIjtcblxuXHRmdW5jdGlvbiBvbkJsdXIoKSB7XG5cdFx0aWYgKHZhbHVlID09PSBcIlwiKSB7XG5cdFx0XHRpc0ludmFsaWQgPSBmYWxzZTtcblx0XHRcdGVycm9yID0gXCJcIjtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgaXBwb3J0ID0gdmFsdWUuc3BsaXQoXCI6XCIpO1xuXHRcdGlmIChpcHBvcnQubGVuZ3RoICE9PSAyKSB7XG5cdFx0XHRpc0ludmFsaWQgPSB0cnVlO1xuXHRcdFx0ZXJyb3IgPSBcIm1pc3NpbmcgcG9ydCBudW1iZXJcIjtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgaXAgPSBpcHBvcnRbMF07XG5cdFx0Y29uc3QgcG9ydCA9IHBhcnNlSW50KGlwcG9ydFsxXSk7XG5cdFx0aWYgKGlzTmFOKHBvcnQpIHx8IHBvcnQgPD0gMCB8fCBwb3J0ID49IDY1NTM1KSB7XG5cdFx0XHRpc0ludmFsaWQgPSB0cnVlO1xuXHRcdFx0ZXJyb3IgPSBcImludmFsaWQgcG9ydCBudW1iZXJcIjtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aXNJbnZhbGlkID0gZmFsc2U7XG5cdFx0dmFsdWUgPSBpcCArXCI6XCIrIHBvcnQ7XG5cdH1cbjwvc2NyaXB0PlxuXG48c3R5bGU+XG5cdC53dWktaW5wdXQtaXBwb3J0IHtcblx0XHRkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG5cdFx0d2lkdGg6IDEwMCU7XG5cdH1cblx0Lnd1aS1pbnB1dC1pcHBvcnQgaW5wdXQge1xuXHRcdHdpZHRoOiAxMDAlO1xuXHR9XG5cdC5pbnZhbGlkIHtcblx0XHRjb2xvcjogcmVkO1xuXHR9XG5cdGRpdi5pbnZhbGlkIHtcblx0XHRmb250LXNpemU6IDEycHg7XG5cdH1cbjwvc3R5bGU+XG5cbjxkaXYgY2xhc3M9XCJ3dWktaW5wdXQtaXBwb3J0XCI+XG5cdDxpbnB1dFxuXHRcdHR5cGU9XCJ0ZXh0XCJcblx0XHRiaW5kOnZhbHVlPXt2YWx1ZX1cblx0XHRvbjpibHVyPXtvbkJsdXJ9XG5cdFx0Y2xhc3M6aW52YWxpZD17aXNJbnZhbGlkfVxuXHRcdHBsYWNlaG9sZGVyPVwiMTI3LjAuMC4xOjgwODBcIlxuXHQ+XG5cdHsjaWYgaXNJbnZhbGlkfVxuXHQ8ZGl2IGNsYXNzPVwiaW52YWxpZFwiPntlcnJvcn08L2Rpdj5cblx0ey9pZn1cbjwvZGl2PlxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQThCQyxpQkFBaUIsNEJBQUMsQ0FBQyxBQUNsQixPQUFPLENBQUUsWUFBWSxDQUNyQixLQUFLLENBQUUsSUFBSSxBQUNaLENBQUMsQUFDRCwrQkFBaUIsQ0FBQyxLQUFLLGNBQUMsQ0FBQyxBQUN4QixLQUFLLENBQUUsSUFBSSxBQUNaLENBQUMsQUFDRCxRQUFRLDRCQUFDLENBQUMsQUFDVCxLQUFLLENBQUUsR0FBRyxBQUNYLENBQUMsQUFDRCxHQUFHLFFBQVEsNEJBQUMsQ0FBQyxBQUNaLFNBQVMsQ0FBRSxJQUFJLEFBQ2hCLENBQUMifQ== */";
    	append_dev(document.head, style);
    }

    // (54:1) {#if isInvalid}
    function create_if_block(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*error*/ ctx[2]);
    			attr_dev(div, "class", "invalid svelte-sy39ke");
    			add_location(div, file$2, 54, 1, 911);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*error*/ 4) set_data_dev(t, /*error*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(54:1) {#if isInvalid}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let input;
    	let t;
    	let mounted;
    	let dispose;
    	let if_block = /*isInvalid*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "127.0.0.1:8080");
    			attr_dev(input, "class", "svelte-sy39ke");
    			toggle_class(input, "invalid", /*isInvalid*/ ctx[1]);
    			add_location(input, file$2, 46, 1, 770);
    			attr_dev(div, "class", "wui-input-ipport svelte-sy39ke");
    			add_location(div, file$2, 45, 0, 738);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*value*/ ctx[0]);
    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[4]),
    					listen_dev(input, "blur", /*onBlur*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (dirty & /*isInvalid*/ 2) {
    				toggle_class(input, "invalid", /*isInvalid*/ ctx[1]);
    			}

    			if (/*isInvalid*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { value = "" } = $$props;
    	let isInvalid = false;
    	let error = "";

    	function onBlur() {
    		if (value === "") {
    			$$invalidate(1, isInvalid = false);
    			$$invalidate(2, error = "");
    			return;
    		}

    		const ipport = value.split(":");

    		if (ipport.length !== 2) {
    			$$invalidate(1, isInvalid = true);
    			$$invalidate(2, error = "missing port number");
    			return;
    		}

    		const ip = ipport[0];
    		const port = parseInt(ipport[1]);

    		if (isNaN(port) || port <= 0 || port >= 65535) {
    			$$invalidate(1, isInvalid = true);
    			$$invalidate(2, error = "invalid port number");
    			return;
    		}

    		$$invalidate(1, isInvalid = false);
    		$$invalidate(0, value = ip + ":" + port);
    	}

    	const writable_props = ["value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputIPPort> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("InputIPPort", $$slots, []);

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$set = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ value, isInvalid, error, onBlur });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("isInvalid" in $$props) $$invalidate(1, isInvalid = $$props.isInvalid);
    		if ("error" in $$props) $$invalidate(2, error = $$props.error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, isInvalid, error, onBlur, input_input_handler];
    }

    class InputIPPort extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-sy39ke-style")) add_css$2();
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputIPPort",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get value() {
    		throw new Error("<InputIPPort>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<InputIPPort>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/InputNumber.svelte generated by Svelte v3.24.0 */

    const file$3 = "src/components/InputNumber.svelte";

    function add_css$3() {
    	var style = element("style");
    	style.id = "svelte-1qrd8wr-style";
    	style.textContent = ".wui-input-number.svelte-1qrd8wr.svelte-1qrd8wr{width:100%}.wui-input-number.svelte-1qrd8wr input.svelte-1qrd8wr{display:inline-block;width:70%}.wui-input-number.svelte-1qrd8wr .suffix.svelte-1qrd8wr{width:30%}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5wdXROdW1iZXIuc3ZlbHRlIiwic291cmNlcyI6WyJJbnB1dE51bWJlci5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cblx0ZXhwb3J0IGxldCBtaW47XG5cdGV4cG9ydCBsZXQgbWF4O1xuXHRleHBvcnQgbGV0IHZhbHVlID0gMDtcblx0ZXhwb3J0IGxldCB1bml0O1xuXG5cdGZ1bmN0aW9uIG9uQmx1cigpIHtcblx0XHR2YWx1ZSA9ICt2YWx1ZVxuXHRcdGlmIChpc05hTih2YWx1ZSkpIHtcblx0XHRcdHZhbHVlID0gbWF4XG5cdFx0fSBlbHNlIGlmICh2YWx1ZSA8IG1pbikge1xuXHRcdFx0dmFsdWUgPSBtaW5cblx0XHR9IGVsc2UgaWYgKHZhbHVlID4gbWF4KSB7XG5cdFx0XHR2YWx1ZSA9IG1heFxuXHRcdH1cblx0fVxuPC9zY3JpcHQ+XG5cbjxzdHlsZT5cblx0Lnd1aS1pbnB1dC1udW1iZXIge1xuXHRcdHdpZHRoOiAxMDAlO1xuXHR9XG5cdC53dWktaW5wdXQtbnVtYmVyIGlucHV0IHtcblx0XHRkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG5cdFx0d2lkdGg6IDcwJTtcblx0fVxuXHQud3VpLWlucHV0LW51bWJlciAuc3VmZml4IHtcblx0XHR3aWR0aDogMzAlO1xuXHR9XG48L3N0eWxlPlxuXG48ZGl2IGNsYXNzPVwid3VpLWlucHV0LW51bWJlclwiPlxuXHQ8aW5wdXQgdHlwZT1cIm51bWJlclwiIG9uOmJsdXI9e29uQmx1cn0gYmluZDp2YWx1ZT17dmFsdWV9PlxuXHR7I2lmIHVuaXQgIT09ICcnfVxuXHRcdDxzcGFuIGNsYXNzPVwic3VmZml4XCI+XG5cdFx0XHR7dW5pdH1cblx0XHQ8L3NwYW4+XG5cdHsvaWZ9XG48L2Rpdj5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFtQkMsaUJBQWlCLDhCQUFDLENBQUMsQUFDbEIsS0FBSyxDQUFFLElBQUksQUFDWixDQUFDLEFBQ0QsZ0NBQWlCLENBQUMsS0FBSyxlQUFDLENBQUMsQUFDeEIsT0FBTyxDQUFFLFlBQVksQ0FDckIsS0FBSyxDQUFFLEdBQUcsQUFDWCxDQUFDLEFBQ0QsZ0NBQWlCLENBQUMsT0FBTyxlQUFDLENBQUMsQUFDMUIsS0FBSyxDQUFFLEdBQUcsQUFDWCxDQUFDIn0= */";
    	append_dev(document.head, style);
    }

    // (34:1) {#if unit !== ''}
    function create_if_block$1(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*unit*/ ctx[1]);
    			attr_dev(span, "class", "suffix svelte-1qrd8wr");
    			add_location(span, file$3, 34, 2, 547);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*unit*/ 2) set_data_dev(t, /*unit*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(34:1) {#if unit !== ''}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let input;
    	let t;
    	let mounted;
    	let dispose;
    	let if_block = /*unit*/ ctx[1] !== "" && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			if (if_block) if_block.c();
    			attr_dev(input, "type", "number");
    			attr_dev(input, "class", "svelte-1qrd8wr");
    			add_location(input, file$3, 32, 1, 468);
    			attr_dev(div, "class", "wui-input-number svelte-1qrd8wr");
    			add_location(div, file$3, 31, 0, 436);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*value*/ ctx[0]);
    			append_dev(div, t);
    			if (if_block) if_block.m(div, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "blur", /*onBlur*/ ctx[2], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1 && to_number(input.value) !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (/*unit*/ ctx[1] !== "") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { min } = $$props;
    	let { max } = $$props;
    	let { value = 0 } = $$props;
    	let { unit } = $$props;

    	function onBlur() {
    		$$invalidate(0, value = +value);

    		if (isNaN(value)) {
    			$$invalidate(0, value = max);
    		} else if (value < min) {
    			$$invalidate(0, value = min);
    		} else if (value > max) {
    			$$invalidate(0, value = max);
    		}
    	}

    	const writable_props = ["min", "max", "value", "unit"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InputNumber> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("InputNumber", $$slots, []);

    	function input_input_handler() {
    		value = to_number(this.value);
    		$$invalidate(0, value);
    	}

    	$$self.$set = $$props => {
    		if ("min" in $$props) $$invalidate(3, min = $$props.min);
    		if ("max" in $$props) $$invalidate(4, max = $$props.max);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("unit" in $$props) $$invalidate(1, unit = $$props.unit);
    	};

    	$$self.$capture_state = () => ({ min, max, value, unit, onBlur });

    	$$self.$inject_state = $$props => {
    		if ("min" in $$props) $$invalidate(3, min = $$props.min);
    		if ("max" in $$props) $$invalidate(4, max = $$props.max);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("unit" in $$props) $$invalidate(1, unit = $$props.unit);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, unit, onBlur, min, max, input_input_handler];
    }

    class InputNumber extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1qrd8wr-style")) add_css$3();
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { min: 3, max: 4, value: 0, unit: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InputNumber",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*min*/ ctx[3] === undefined && !("min" in props)) {
    			console.warn("<InputNumber> was created without expected prop 'min'");
    		}

    		if (/*max*/ ctx[4] === undefined && !("max" in props)) {
    			console.warn("<InputNumber> was created without expected prop 'max'");
    		}

    		if (/*unit*/ ctx[1] === undefined && !("unit" in props)) {
    			console.warn("<InputNumber> was created without expected prop 'unit'");
    		}
    	}

    	get min() {
    		throw new Error("<InputNumber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set min(value) {
    		throw new Error("<InputNumber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get max() {
    		throw new Error("<InputNumber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<InputNumber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<InputNumber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<InputNumber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get unit() {
    		throw new Error("<InputNumber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set unit(value) {
    		throw new Error("<InputNumber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/LabelHint.svelte generated by Svelte v3.24.0 */

    const file$4 = "src/components/LabelHint.svelte";

    function add_css$4() {
    	var style = element("style");
    	style.id = "svelte-1bwied5-style";
    	style.textContent = "label.label-hint.svelte-1bwied5{display:inline-flex;margin-top:1em;width:100%}.title.svelte-1bwied5{display:inline-block;width:200px}.toggle.svelte-1bwied5{border-radius:50%;border:1px solid grey;cursor:pointer;display:inline-block;font-size:12px;height:14px;line-height:14px;padding:2px;text-align:center;width:14px}.info.svelte-1bwied5{background-color:#eee;margin:8px 0px;padding:1em}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGFiZWxIaW50LnN2ZWx0ZSIsInNvdXJjZXMiOlsiTGFiZWxIaW50LnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxuXHRleHBvcnQgbGV0IHRpdGxlO1xuXHRleHBvcnQgbGV0IGluZm87XG5cdGxldCBzaG93SW5mbyA9IGZhbHNlO1xuPC9zY3JpcHQ+XG5cbjxzdHlsZT5cblx0bGFiZWwubGFiZWwtaGludCB7XG5cdFx0ZGlzcGxheTogaW5saW5lLWZsZXg7XG5cdFx0bWFyZ2luLXRvcDogMWVtO1xuXHRcdHdpZHRoOiAxMDAlO1xuXHR9XG5cdC5sYWJlbC1oaW50LXRpdGxlIHtcblx0XHRtYXJnaW4tYm90dG9tOiA0cHg7XG5cdH1cblx0LnRpdGxlIHtcblx0XHRkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG5cdFx0d2lkdGg6IDIwMHB4O1xuXHR9XG5cdC50b2dnbGUge1xuXHRcdGJvcmRlci1yYWRpdXM6IDUwJTtcblx0XHRib3JkZXI6IDFweCBzb2xpZCBncmV5O1xuXHRcdGN1cnNvcjogcG9pbnRlcjtcblx0XHRkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG5cdFx0Zm9udC1zaXplOiAxMnB4O1xuXHRcdGhlaWdodDogMTRweDtcblx0XHRsaW5lLWhlaWdodDogMTRweDtcblx0XHRwYWRkaW5nOiAycHg7XG5cdFx0dGV4dC1hbGlnbjogY2VudGVyO1xuXHRcdHdpZHRoOiAxNHB4O1xuXHR9XG5cdC5pbmZvIHtcblx0XHRiYWNrZ3JvdW5kLWNvbG9yOiAjZWVlO1xuXHRcdG1hcmdpbjogOHB4IDBweDtcblx0XHRwYWRkaW5nOiAxZW07XG5cdH1cbjwvc3R5bGU+XG5cbjxsYWJlbCBjbGFzcz1cImxhYmVsLWhpbnRcIj5cblx0PHNwYW4gY2xhc3M9XCJ0aXRsZVwiPlxuXHRcdHt0aXRsZX1cblx0XHQ8c3BhbiBjbGFzcz1cInRvZ2dsZVwiIG9uOmNsaWNrPXsoKSA9PiBzaG93SW5mbyA9ICFzaG93SW5mb30+XG5cdFx0XHQ/XG5cdFx0PC9zcGFuPlxuXHQ8L3NwYW4+XG5cblx0PHNsb3Q+XG5cdDwvc2xvdD5cblxuPC9sYWJlbD5cblxueyNpZiBzaG93SW5mb31cbjxkaXYgY2xhc3M9XCJpbmZvXCI+XG5cdHtAaHRtbCBpbmZvfVxuPC9kaXY+XG57L2lmfVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU9DLEtBQUssV0FBVyxlQUFDLENBQUMsQUFDakIsT0FBTyxDQUFFLFdBQVcsQ0FDcEIsVUFBVSxDQUFFLEdBQUcsQ0FDZixLQUFLLENBQUUsSUFBSSxBQUNaLENBQUMsQUFJRCxNQUFNLGVBQUMsQ0FBQyxBQUNQLE9BQU8sQ0FBRSxZQUFZLENBQ3JCLEtBQUssQ0FBRSxLQUFLLEFBQ2IsQ0FBQyxBQUNELE9BQU8sZUFBQyxDQUFDLEFBQ1IsYUFBYSxDQUFFLEdBQUcsQ0FDbEIsTUFBTSxDQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUN0QixNQUFNLENBQUUsT0FBTyxDQUNmLE9BQU8sQ0FBRSxZQUFZLENBQ3JCLFNBQVMsQ0FBRSxJQUFJLENBQ2YsTUFBTSxDQUFFLElBQUksQ0FDWixXQUFXLENBQUUsSUFBSSxDQUNqQixPQUFPLENBQUUsR0FBRyxDQUNaLFVBQVUsQ0FBRSxNQUFNLENBQ2xCLEtBQUssQ0FBRSxJQUFJLEFBQ1osQ0FBQyxBQUNELEtBQUssZUFBQyxDQUFDLEFBQ04sZ0JBQWdCLENBQUUsSUFBSSxDQUN0QixNQUFNLENBQUUsR0FBRyxDQUFDLEdBQUcsQ0FDZixPQUFPLENBQUUsR0FBRyxBQUNiLENBQUMifQ== */";
    	append_dev(document.head, style);
    }

    // (52:0) {#if showInfo}
    function create_if_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "info svelte-1bwied5");
    			add_location(div, file$4, 52, 0, 756);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = /*info*/ ctx[1];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*info*/ 2) div.innerHTML = /*info*/ ctx[1];		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(52:0) {#if showInfo}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let label;
    	let span1;
    	let t0;
    	let t1;
    	let span0;
    	let t3;
    	let t4;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);
    	let if_block = /*showInfo*/ ctx[2] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			span1 = element("span");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			span0 = element("span");
    			span0.textContent = "?";
    			t3 = space();
    			if (default_slot) default_slot.c();
    			t4 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(span0, "class", "toggle svelte-1bwied5");
    			add_location(span0, file$4, 41, 2, 628);
    			attr_dev(span1, "class", "title svelte-1bwied5");
    			add_location(span1, file$4, 39, 1, 595);
    			attr_dev(label, "class", "label-hint svelte-1bwied5");
    			add_location(label, file$4, 38, 0, 567);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, span1);
    			append_dev(span1, t0);
    			append_dev(span1, t1);
    			append_dev(span1, span0);
    			append_dev(label, t3);

    			if (default_slot) {
    				default_slot.m(label, null);
    			}

    			insert_dev(target, t4, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(span0, "click", /*click_handler*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (/*showInfo*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { title } = $$props;
    	let { info } = $$props;
    	let showInfo = false;
    	const writable_props = ["title", "info"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LabelHint> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("LabelHint", $$slots, ['default']);
    	const click_handler = () => $$invalidate(2, showInfo = !showInfo);

    	$$self.$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("info" in $$props) $$invalidate(1, info = $$props.info);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ title, info, showInfo });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("info" in $$props) $$invalidate(1, info = $$props.info);
    		if ("showInfo" in $$props) $$invalidate(2, showInfo = $$props.showInfo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, info, showInfo, $$scope, $$slots, click_handler];
    }

    class LabelHint extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-1bwied5-style")) add_css$4();
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { title: 0, info: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LabelHint",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<LabelHint> was created without expected prop 'title'");
    		}

    		if (/*info*/ ctx[1] === undefined && !("info" in props)) {
    			console.warn("<LabelHint> was created without expected prop 'info'");
    		}
    	}

    	get title() {
    		throw new Error("<LabelHint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<LabelHint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get info() {
    		throw new Error("<LabelHint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set info(value) {
    		throw new Error("<LabelHint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.0 */
    const file$5 = "src/App.svelte";

    function add_css$5() {
    	var style = element("style");
    	style.id = "svelte-gul268-style";
    	style.textContent = "div.test-label-input.svelte-gul268{margin:0 0 1em 0}\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwLnN2ZWx0ZSIsInNvdXJjZXMiOlsiQXBwLnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxuXHRpbXBvcnQgeyBXdWlJbnB1dElQUG9ydCB9IGZyb20gJy4vY29tcG9uZW50cy9pbmRleCc7XG5cdGltcG9ydCB7IFd1aUlucHV0TnVtYmVyIH0gZnJvbSAnLi9jb21wb25lbnRzL2luZGV4Jztcblx0aW1wb3J0IHsgV3VpTGFiZWxIaW50IH0gZnJvbSAnLi9jb21wb25lbnRzL2luZGV4Jztcblx0aW1wb3J0IHsgV3VpTm90aWYsIFd1aVB1c2hOb3RpZiB9IGZyb20gJy4vY29tcG9uZW50cy9pbmRleCc7XG5cblx0bGV0IG4gPSAwO1xuXHRmdW5jdGlvbiBzaG93Tm90aWZpY2F0aW9uKCkge1xuXHRcdG4gPSBuICsgMVxuXHRcdFd1aVB1c2hOb3RpZihcInRlc3QgXCIrbik7XG5cdH1cblxuXHRsZXQgYWRkcmVzcyA9IFwiXCI7XG5cdGxldCBudW1iZXIgPSAwO1xuPC9zY3JpcHQ+XG5cbjxzdHlsZT5cblx0ZGl2LnRlc3QtbGFiZWwtaW5wdXQge1xuXHRcdG1hcmdpbjogMCAwIDFlbSAwO1xuXHR9XG5cdGxhYmVsLnRlc3QtaW5wdXQge1xuXHRcdHdpZHRoOiAxMDAlO1xuXHRcdGRpc3BsYXk6IGlubGluZS1mbGV4O1xuXHR9XG5cdGxhYmVsLnRlc3QtaW5wdXQgPiBzcGFuIHtcblx0XHRkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG5cdFx0d2lkdGg6IDIwMHB4O1xuXHR9XG48L3N0eWxlPlxuXG48bWFpbj5cblx0PFd1aU5vdGlmIC8+XG5cblx0PGJ1dHRvbiBvbjpjbGljaz17c2hvd05vdGlmaWNhdGlvbn0+XG5cdFx0UHVzaCBub3RpZmljYXRpb25cblx0PC9idXR0b24+XG5cblx0PGRpdiBjbGFzcz1cInRlc3QtbGFiZWwtaW5wdXRcIj5cblx0XHQ8V3VpTGFiZWxIaW50XG5cdFx0XHR0aXRsZT1cIklucHV0SVBQb3J0XCJcblx0XHRcdGluZm89XCJJbnB1dCBJUCBhZGRyZXNzIGFuZCBwb3J0IG51bWJlclwiXG5cdFx0PlxuXHRcdFx0PFd1aUlucHV0SVBQb3J0IGJpbmQ6dmFsdWU9e2FkZHJlc3N9Lz5cblx0XHQ8L1d1aUxhYmVsSGludD5cblx0XHQ8ZGl2PlxuXHRcdFx0T3V0cHV0OiB7YWRkcmVzc31cblx0XHQ8L2Rpdj5cblx0PC9kaXY+XG5cblx0PGRpdiBjbGFzcz1cInRlc3QtbGFiZWwtaW5wdXRcIj5cblx0XHQ8V3VpTGFiZWxIaW50XG5cdFx0XHR0aXRsZT1cIklucHV0TnVtYmVyXCJcblx0XHRcdGluZm89XCJJbnB1dCBudW1iZXIgd2l0aCBtaW5pbXVtIHZhbHVlIGlzIDEgYW5kIG1heGltdW0gaXMgMTBcIlxuXHRcdD5cblx0XHRcdDxXdWlJbnB1dE51bWJlciBtYXg9MTAgbWluPTEgYmluZDp2YWx1ZT17bnVtYmVyfSB1bml0PVwic2Vjb25kc1wiLz5cblx0XHQ8L1d1aUxhYmVsSGludD5cblx0XHQ8ZGl2PlxuXHRcdFx0T3V0cHV0OiB7bnVtYmVyfVxuXHRcdDwvZGl2PlxuXHQ8L2Rpdj5cbjwvbWFpbj5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFpQkMsR0FBRyxpQkFBaUIsY0FBQyxDQUFDLEFBQ3JCLE1BQU0sQ0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEFBQ2xCLENBQUMifQ== */";
    	append_dev(document.head, style);
    }

    // (39:2) <WuiLabelHint    title="InputIPPort"    info="Input IP address and port number"   >
    function create_default_slot_1(ctx) {
    	let wuiinputipport;
    	let updating_value;
    	let current;

    	function wuiinputipport_value_binding(value) {
    		/*wuiinputipport_value_binding*/ ctx[3].call(null, value);
    	}

    	let wuiinputipport_props = {};

    	if (/*address*/ ctx[0] !== void 0) {
    		wuiinputipport_props.value = /*address*/ ctx[0];
    	}

    	wuiinputipport = new InputIPPort({
    			props: wuiinputipport_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(wuiinputipport, "value", wuiinputipport_value_binding));

    	const block = {
    		c: function create() {
    			create_component(wuiinputipport.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(wuiinputipport, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const wuiinputipport_changes = {};

    			if (!updating_value && dirty & /*address*/ 1) {
    				updating_value = true;
    				wuiinputipport_changes.value = /*address*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			wuiinputipport.$set(wuiinputipport_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(wuiinputipport.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(wuiinputipport.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(wuiinputipport, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(39:2) <WuiLabelHint    title=\\\"InputIPPort\\\"    info=\\\"Input IP address and port number\\\"   >",
    		ctx
    	});

    	return block;
    }

    // (51:2) <WuiLabelHint    title="InputNumber"    info="Input number with minimum value is 1 and maximum is 10"   >
    function create_default_slot(ctx) {
    	let wuiinputnumber;
    	let updating_value;
    	let current;

    	function wuiinputnumber_value_binding(value) {
    		/*wuiinputnumber_value_binding*/ ctx[4].call(null, value);
    	}

    	let wuiinputnumber_props = { max: "10", min: "1", unit: "seconds" };

    	if (/*number*/ ctx[1] !== void 0) {
    		wuiinputnumber_props.value = /*number*/ ctx[1];
    	}

    	wuiinputnumber = new InputNumber({
    			props: wuiinputnumber_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(wuiinputnumber, "value", wuiinputnumber_value_binding));

    	const block = {
    		c: function create() {
    			create_component(wuiinputnumber.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(wuiinputnumber, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const wuiinputnumber_changes = {};

    			if (!updating_value && dirty & /*number*/ 2) {
    				updating_value = true;
    				wuiinputnumber_changes.value = /*number*/ ctx[1];
    				add_flush_callback(() => updating_value = false);
    			}

    			wuiinputnumber.$set(wuiinputnumber_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(wuiinputnumber.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(wuiinputnumber.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(wuiinputnumber, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(51:2) <WuiLabelHint    title=\\\"InputNumber\\\"    info=\\\"Input number with minimum value is 1 and maximum is 10\\\"   >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let main;
    	let wuinotif;
    	let t0;
    	let button;
    	let t2;
    	let div1;
    	let wuilabelhint0;
    	let t3;
    	let div0;
    	let t4;
    	let t5;
    	let t6;
    	let div3;
    	let wuilabelhint1;
    	let t7;
    	let div2;
    	let t8;
    	let t9;
    	let current;
    	let mounted;
    	let dispose;
    	wuinotif = new Notif({ $$inline: true });

    	wuilabelhint0 = new LabelHint({
    			props: {
    				title: "InputIPPort",
    				info: "Input IP address and port number",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	wuilabelhint1 = new LabelHint({
    			props: {
    				title: "InputNumber",
    				info: "Input number with minimum value is 1 and maximum is 10",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(wuinotif.$$.fragment);
    			t0 = space();
    			button = element("button");
    			button.textContent = "Push notification";
    			t2 = space();
    			div1 = element("div");
    			create_component(wuilabelhint0.$$.fragment);
    			t3 = space();
    			div0 = element("div");
    			t4 = text("Output: ");
    			t5 = text(/*address*/ ctx[0]);
    			t6 = space();
    			div3 = element("div");
    			create_component(wuilabelhint1.$$.fragment);
    			t7 = space();
    			div2 = element("div");
    			t8 = text("Output: ");
    			t9 = text(/*number*/ ctx[1]);
    			add_location(button, file$5, 33, 1, 587);
    			add_location(div0, file$5, 44, 2, 836);
    			attr_dev(div1, "class", "test-label-input svelte-gul268");
    			add_location(div1, file$5, 37, 1, 657);
    			add_location(div2, file$5, 56, 2, 1110);
    			attr_dev(div3, "class", "test-label-input svelte-gul268");
    			add_location(div3, file$5, 49, 1, 882);
    			add_location(main, file$5, 30, 0, 564);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(wuinotif, main, null);
    			append_dev(main, t0);
    			append_dev(main, button);
    			append_dev(main, t2);
    			append_dev(main, div1);
    			mount_component(wuilabelhint0, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, t4);
    			append_dev(div0, t5);
    			append_dev(main, t6);
    			append_dev(main, div3);
    			mount_component(wuilabelhint1, div3, null);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			append_dev(div2, t8);
    			append_dev(div2, t9);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*showNotification*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const wuilabelhint0_changes = {};

    			if (dirty & /*$$scope, address*/ 65) {
    				wuilabelhint0_changes.$$scope = { dirty, ctx };
    			}

    			wuilabelhint0.$set(wuilabelhint0_changes);
    			if (!current || dirty & /*address*/ 1) set_data_dev(t5, /*address*/ ctx[0]);
    			const wuilabelhint1_changes = {};

    			if (dirty & /*$$scope, number*/ 66) {
    				wuilabelhint1_changes.$$scope = { dirty, ctx };
    			}

    			wuilabelhint1.$set(wuilabelhint1_changes);
    			if (!current || dirty & /*number*/ 2) set_data_dev(t9, /*number*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(wuinotif.$$.fragment, local);
    			transition_in(wuilabelhint0.$$.fragment, local);
    			transition_in(wuilabelhint1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(wuinotif.$$.fragment, local);
    			transition_out(wuilabelhint0.$$.fragment, local);
    			transition_out(wuilabelhint1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(wuinotif);
    			destroy_component(wuilabelhint0);
    			destroy_component(wuilabelhint1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let n = 0;

    	function showNotification() {
    		n = n + 1;
    		WuiPushNotif("test " + n);
    	}

    	let address = "";
    	let number = 0;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function wuiinputipport_value_binding(value) {
    		address = value;
    		$$invalidate(0, address);
    	}

    	function wuiinputnumber_value_binding(value) {
    		number = value;
    		$$invalidate(1, number);
    	}

    	$$self.$capture_state = () => ({
    		WuiInputIPPort: InputIPPort,
    		WuiInputNumber: InputNumber,
    		WuiLabelHint: LabelHint,
    		WuiNotif: Notif,
    		WuiPushNotif,
    		n,
    		showNotification,
    		address,
    		number
    	});

    	$$self.$inject_state = $$props => {
    		if ("n" in $$props) n = $$props.n;
    		if ("address" in $$props) $$invalidate(0, address = $$props.address);
    		if ("number" in $$props) $$invalidate(1, number = $$props.number);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		address,
    		number,
    		showNotification,
    		wuiinputipport_value_binding,
    		wuiinputnumber_value_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		if (!document.getElementById("svelte-gul268-style")) add_css$5();
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
