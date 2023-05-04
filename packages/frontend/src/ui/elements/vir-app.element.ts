import {backendPortNumber, backendRequestWaitDuration} from '@electrovir/common';
import {classMap, css, defineElementNoInputs, html, listen} from 'element-vir';

export const VirApp = defineElementNoInputs({
    tagName: 'vir-app',
    stateInit: {
        timeLeftMs: undefined as number | undefined,
        endTime: undefined as number | undefined,
        abortController: undefined as AbortController | undefined,
    },
    styles: css`
        :host {
            padding: 64px;
            gap: 24px;
            display: flex;
            flex-direction: column;
            font-size: 2em;
            font-family: san-serif;
            align-items: flex-start;
        }

        button {
            --accent-color: dodgerblue;

            padding: 8px 16px;
            border-radius: 8px;
            color: var(--accent-color);
            font-weight: bold;
            border: 2px solid var(--accent-color);
            background: transparent;
            cursor: pointer;
            transition: 120ms;
        }

        button:hover {
            background-color: var(--accent-color);
            color: white;
        }

        .abort {
            --accent-color: red;
        }

        .disabled {
            pointer-events: none;
            opacity: 0.3;
        }
    `,
    renderCallback({state, updateState}) {
        const endTimeStamp = state.endTime;
        if (endTimeStamp != undefined && state.timeLeftMs != undefined) {
            if (state.timeLeftMs > -100) {
                window.requestAnimationFrame(() => {
                    const timeLeft = endTimeStamp - Date.now();
                    updateState({timeLeftMs: timeLeft});

                    if (timeLeft < 0) {
                        updateState({
                            endTime: undefined,
                            timeLeftMs: undefined,
                            abortController: undefined,
                        });
                    }
                });
            } else {
                updateState({
                    endTime: undefined,
                    timeLeftMs: undefined,
                    abortController: undefined,
                });
            }
        }

        return html`
            <button
                class=${classMap({
                    disabled: state.endTime != undefined,
                })}
                ${listen('click', async () => {
                    const abortController = new AbortController();
                    updateState({
                        endTime: Date.now() + backendRequestWaitDuration,
                        timeLeftMs: backendRequestWaitDuration,
                        abortController,
                    });

                    try {
                        await fetch(`http://localhost:${backendPortNumber}`, {
                            signal: abortController.signal,
                        });
                    } catch (error) {
                        updateState({
                            endTime: undefined,
                            timeLeftMs: undefined,
                            abortController: undefined,
                        });
                        console.error('got error: ', error);
                    }
                })}
            >
                Start Fetch
            </button>
            <button
                class=${classMap({
                    abort: true,
                    disabled: state.endTime == undefined,
                })}
                ${listen('click', () => {
                    if (state.abortController) {
                        state.abortController.abort();
                    }
                })}
            >
                Abort Fetch
            </button>

            <p class="countdown">
                ${state.timeLeftMs == undefined
                    ? ''
                    : Math.max(Math.round(state.timeLeftMs / 1000), 0)}
            </p>
        `;
    },
});
