/**
 * 智能问数设置弹窗（与 index.html 设置页同源）
 */
(function initSettingsModal(global) {
  const SETTINGS_MODAL_HTML = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8').decode(Uint8Array.from(atob('PGRpdiBjbGFzcz0ic2V0dGluZ3MtbW9kYWwtb3ZlcmxheSIgaWQ9InNldHRpbmdzTW9kYWxPdmVybGF5IiBoaWRkZW4+DQogICAgPGRpdiBjbGFzcz0ic2V0dGluZ3MtbW9kYWwiIHJvbGU9ImRpYWxvZyIgYXJpYS1tb2RhbD0idHJ1ZSIgYXJpYS1sYWJlbGxlZGJ5PSJzZXR0aW5nc01vZGFsVGl0bGUiPg0KICAgICAgPGRpdiBjbGFzcz0ic2V0dGluZ3MtbW9kYWwtaGVhZCI+DQogICAgICAgIDxoMiBjbGFzcz0ic2V0dGluZ3MtbW9kYWwtdGl0bGUiIGlkPSJzZXR0aW5nc01vZGFsVGl0bGUiPuaZuuiDvemXruaVsOiuvue9rjwvaDI+DQogICAgICAgIDxidXR0b24gY2xhc3M9InNldHRpbmdzLW1vZGFsLWNsb3NlIiBpZD0iY2xvc2VTZXR0aW5nc01vZGFsIiB0eXBlPSJidXR0b24iIGFyaWEtbGFiZWw9IuWFs+mXrSI+w5c8L2J1dHRvbj4NCiAgICAgIDwvZGl2Pg0KICAgICAgPGRpdiBjbGFzcz0ic2V0dGluZ3MtbW9kYWwtYm9keSI+DQogICAgICAgIDxuYXYgY2xhc3M9InNldHRpbmdzLW5hdiIgYXJpYS1sYWJlbD0i6K6+572u5YiG57G7Ij4NCiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJzZXR0aW5ncy1uYXYtaXRlbSBhY3RpdmUiIHR5cGU9ImJ1dHRvbiIgZGF0YS1zZXR0aW5ncy1wYW5lbD0idGVybXMiPuacr+ivremFjee9rjwvYnV0dG9uPg0KICAgICAgICAgIDxidXR0b24gY2xhc3M9InNldHRpbmdzLW5hdi1pdGVtIiB0eXBlPSJidXR0b24iIGRhdGEtc2V0dGluZ3MtcGFuZWw9InNxbCI+U1FM56S65L6L5bqTPC9idXR0b24+DQogICAgICAgICAgPGJ1dHRvbiBjbGFzcz0ic2V0dGluZ3MtbmF2LWl0ZW0iIHR5cGU9ImJ1dHRvbiIgZGF0YS1zZXR0aW5ncy1wYW5lbD0icHJvbXB0Ij7oh6rlrprkuYnmj5DnpLror408L2J1dHRvbj4NCiAgICAgICAgPC9uYXY+DQogICAgICAgIDxkaXYgY2xhc3M9InNldHRpbmdzLWNvbnRlbnQiPg0KICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPSJzZXR0aW5ncy1wYW5lbCBhY3RpdmUiIGRhdGEtc2V0dGluZ3MtcGFuZWw9InRlcm1zIj4NCiAgICAgICAgICAgIDxkaXYgY2xhc3M9InNldHRpbmdzLWFsZXJ0Ij4NCiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InNldHRpbmdzLWFsZXJ0LWljb24iPmk8L3NwYW4+DQogICAgICAgICAgICAgIDxwPuS8geS4mueUqOaIt+WPr+WcqOatpOWkhOWvueacr+ivrei/m+ihjOeuoeeQhu+8jOW4ruWKqeWkp+aooeWei+abtOWlveWcsOeQhuino+S8geS4muS4muWKoeacr+ivreOAgeS4muWKoemAu+i+keOAgeWtl+auteS/oeaBr++8jOaPkOWNhyBTUUwvTURMIOeUn+aIkOeahOWHhuehruaAp+OAgjwvcD4NCiAgICAgICAgICAgIDwvZGl2Pg0KICAgICAgICAgICAgPGRpdiBjbGFzcz0ic2V0dGluZ3MtdG9vbGJhciI+DQogICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0ic2V0dGluZ3Mtc2VhcmNoLXdyYXAiPg0KICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJzZXR0aW5ncy1zZWFyY2gtaWNvbiI+4oyVPC9zcGFuPg0KICAgICAgICAgICAgICAgIDxpbnB1dCBpZD0idGVybVNlYXJjaElucHV0IiB0eXBlPSJ0ZXh0IiBwbGFjZWhvbGRlcj0i6K+36L6T5YWl5pyv6K+t5ZCN56ewIC8g5ZCM5LmJ6K+NIC8g5o+P6L+wIiAvPg0KICAgICAgICAgICAgICA8L2xhYmVsPg0KICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJzZXR0aW5ncy1idG4gcHJpbWFyeSIgaWQ9InRlcm1DcmVhdGVCdG4iIHR5cGU9ImJ1dHRvbiI+5Yib5bu6PC9idXR0b24+DQogICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9InNldHRpbmdzLWJ0biIgaWQ9InRlcm1CYXRjaERlbGV0ZUJ0biIgdHlwZT0iYnV0dG9uIiBkaXNhYmxlZD7mibnph4/liKDpmaQ8L2J1dHRvbj4NCiAgICAgICAgICAgIDwvZGl2Pg0KICAgICAgICAgICAgPGRpdiBjbGFzcz0ic2V0dGluZ3MtdGFibGUtd3JhcCI+DQogICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz0ic2V0dGluZ3MtdGFibGUiPg0KICAgICAgICAgICAgICAgIDx0aGVhZD4NCiAgICAgICAgICAgICAgICAgIDx0cj4NCiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJjb2wtY2hlY2siPjxpbnB1dCBpZD0idGVybVNlbGVjdEFsbCIgdHlwZT0iY2hlY2tib3giIGFyaWEtbGFiZWw9IuWFqOmAiSIgZGlzYWJsZWQgLz48L3RoPg0KICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9ImNvbC1pbmRleCI+5bqP5Y+3PC90aD4NCiAgICAgICAgICAgICAgICAgICAgPHRoPuacr+ivreWQjeensDwvdGg+DQogICAgICAgICAgICAgICAgICAgIDx0aD7lkIzkuYnor40v5qCH562+PC90aD4NCiAgICAgICAgICAgICAgICAgICAgPHRoPuacr+ivreaPj+i/sDwvdGg+DQogICAgICAgICAgICAgICAgICAgIDx0aD7liJvlu7rkuro8L3RoPg0KICAgICAgICAgICAgICAgICAgICA8dGg+5Yib5bu65pe26Ze0PC90aD4NCiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJjb2wtYWN0aW9ucyI+5pON5L2cPC90aD4NCiAgICAgICAgICAgICAgICAgIDwvdHI+DQogICAgICAgICAgICAgICAgPC90aGVhZD4NCiAgICAgICAgICAgICAgICA8dGJvZHkgaWQ9InRlcm1UYWJsZUJvZHkiPjwvdGJvZHk+DQogICAgICAgICAgICAgIDwvdGFibGU+DQogICAgICAgICAgICA8L2Rpdj4NCiAgICAgICAgICA8L3NlY3Rpb24+DQogICAgICAgICAgPHNlY3Rpb24gY2xhc3M9InNldHRpbmdzLXBhbmVsIiBkYXRhLXNldHRpbmdzLXBhbmVsPSJzcWwiPg0KICAgICAgICAgICAgPGRpdiBjbGFzcz0ic2V0dGluZ3MtYWxlcnQiPg0KICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0ic2V0dGluZ3MtYWxlcnQtaWNvbiI+aTwvc3Bhbj4NCiAgICAgICAgICAgICAgPHA+5Zyo5q2k5YiX6KGo77yM55So5oi35Y+v5Lul566h55CG5ZKM5L+d5a2Y44CM6Zeu6aKYIC0gU1FM44CN56S65L6L5a+544CC6L+Z5Lqb56S65L6L5a+55pyJ5Yqp5LqO6Zeu5pWw5pm66IO95LqG6Kej5b2T5YmN55So5oi357yW5YaZIFNRTCDor63lj6XnmoTmlrnlvI/vvIzku47ogIzog73lpJ/nlJ/miJDmm7TnrKblkIjnlKjmiLfpooTmnJ/nmoTmn6Xor6Lnu5PmnpzjgII8L3A+DQogICAgICAgICAgICA8L2Rpdj4NCiAgICAgICAgICAgIDxkaXYgY2xhc3M9InNldHRpbmdzLXRvb2xiYXIiPg0KICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9InNldHRpbmdzLXNlYXJjaC13cmFwIj4NCiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0ic2V0dGluZ3Mtc2VhcmNoLWljb24iPuKMlTwvc3Bhbj4NCiAgICAgICAgICAgICAgICA8aW5wdXQgaWQ9InNxbFNlYXJjaElucHV0IiB0eXBlPSJ0ZXh0IiBwbGFjZWhvbGRlcj0i6K+36L6T5YWl6Zeu6aKY5o+P6L+wIiAvPg0KICAgICAgICAgICAgICA8L2xhYmVsPg0KICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJzZXR0aW5ncy1idG4gcHJpbWFyeSIgaWQ9InNxbENyZWF0ZUJ0biIgdHlwZT0iYnV0dG9uIj7liJvlu7o8L2J1dHRvbj4NCiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0ic2V0dGluZ3MtYnRuIiBpZD0ic3FsQmF0Y2hEZWxldGVCdG4iIHR5cGU9ImJ1dHRvbiIgZGlzYWJsZWQ+5om56YeP5Yig6ZmkPC9idXR0b24+DQogICAgICAgICAgICA8L2Rpdj4NCiAgICAgICAgICAgIDxkaXYgY2xhc3M9InNldHRpbmdzLXRhYmxlLXdyYXAiPg0KICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9InNldHRpbmdzLXRhYmxlIHNxbC10YWJsZSI+DQogICAgICAgICAgICAgICAgPHRoZWFkPg0KICAgICAgICAgICAgICAgICAgPHRyPg0KICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9ImNvbC1jaGVjayI+PGlucHV0IGlkPSJzcWxTZWxlY3RBbGwiIHR5cGU9ImNoZWNrYm94IiBhcmlhLWxhYmVsPSLlhajpgIkiIGRpc2FibGVkIC8+PC90aD4NCiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJjb2wtaW5kZXgiPuW6j+WPtzwvdGg+DQogICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0iY29sLXF1ZXN0aW9uIj7pl67popjmj4/ov7A8L3RoPg0KICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9ImNvbC1zcWwiPuekuuS+i1NRTDwvdGg+DQogICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0iY29sLWRvbWFpbiI+5Lia5Yqh5Z+fPC90aD4NCiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJjb2wtcmVjb21tZW5kIj7orr7nva7kuLrmjqjojZDpl67popg8L3RoPg0KICAgICAgICAgICAgICAgICAgICA8dGg+5Yib5bu65Lq6PC90aD4NCiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJjb2wtYWN0aW9ucyI+5pON5L2cPC90aD4NCiAgICAgICAgICAgICAgICAgIDwvdHI+DQogICAgICAgICAgICAgICAgPC90aGVhZD4NCiAgICAgICAgICAgICAgICA8dGJvZHkgaWQ9InNxbFRhYmxlQm9keSI+PC90Ym9keT4NCiAgICAgICAgICAgICAgPC90YWJsZT4NCiAgICAgICAgICAgIDwvZGl2Pg0KICAgICAgICAgIDwvc2VjdGlvbj4NCiAgICAgICAgICA8c2VjdGlvbiBjbGFzcz0ic2V0dGluZ3MtcGFuZWwiIGRhdGEtc2V0dGluZ3MtcGFuZWw9InByb21wdCI+DQogICAgICAgICAgICA8ZGl2IGNsYXNzPSJzZXR0aW5ncy1hbGVydCI+DQogICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJzZXR0aW5ncy1hbGVydC1pY29uIj5pPC9zcGFuPg0KICAgICAgICAgICAgICA8cD7lnKjmraTliJfooajvvIzmjIfku6TmmK/luK7liqnmjIflr7zpl67mlbDlpoLkvZXnlJ/miJAgU1FMIOafpeivouWSjOWTjeW6lOeahOaMh+WNl+OAguWug+S7rOWFgeiuuOaCqOWumuS5ieS4muWKoeinhOWImeOAgeaVsOaNruaooeWei+eQhuino+WSjOafpeivouaooeW8j++8jOS7peehruS/neeUn+aIkOS4gOiHtOOAgeWHhuehruS4lOespuWQiOaCqOe7hOe7h+eJueWumumcgOaxgueahOe7k+aenOOAgjwvcD4NCiAgICAgICAgICAgIDwvZGl2Pg0KICAgICAgICAgICAgPGRpdiBjbGFzcz0ic2V0dGluZ3MtdG9vbGJhciI+DQogICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0ic2V0dGluZ3Mtc2VhcmNoLXdyYXAiPg0KICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJzZXR0aW5ncy1zZWFyY2gtaWNvbiI+4oyVPC9zcGFuPg0KICAgICAgICAgICAgICAgIDxpbnB1dCBpZD0icHJvbXB0U2VhcmNoSW5wdXQiIHR5cGU9InRleHQiIHBsYWNlaG9sZGVyPSLor7fovpPlhaXmjIfku6TlhoXlrrkiIC8+DQogICAgICAgICAgICAgIDwvbGFiZWw+DQogICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9InNldHRpbmdzLWJ0biBwcmltYXJ5IiBpZD0icHJvbXB0Q3JlYXRlQnRuIiB0eXBlPSJidXR0b24iPuWIm+W7ujwvYnV0dG9uPg0KICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJzZXR0aW5ncy1idG4iIGlkPSJwcm9tcHRCYXRjaERlbGV0ZUJ0biIgdHlwZT0iYnV0dG9uIiBkaXNhYmxlZD7mibnph4/liKDpmaQ8L2J1dHRvbj4NCiAgICAgICAgICAgIDwvZGl2Pg0KICAgICAgICAgICAgPGRpdiBjbGFzcz0ic2V0dGluZ3MtdGFibGUtd3JhcCI+DQogICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz0ic2V0dGluZ3MtdGFibGUgcHJvbXB0LXRhYmxlIj4NCiAgICAgICAgICAgICAgICA8dGhlYWQ+DQogICAgICAgICAgICAgICAgICA8dHI+DQogICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0iY29sLWNoZWNrIj48aW5wdXQgaWQ9InByb21wdFNlbGVjdEFsbCIgdHlwZT0iY2hlY2tib3giIGFyaWEtbGFiZWw9IuWFqOmAiSIgZGlzYWJsZWQgLz48L3RoPg0KICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9ImNvbC1pbmRleCI+5bqP5Y+3PC90aD4NCiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJjb2wtaW5zdHJ1Y3Rpb24iPuaMh+S7pDwvdGg+DQogICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0iY29sLWRvbWFpbiI+5Lia5Yqh5Z+fPC90aD4NCiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJjb2wtZW5hYmxlZCI+5ZCv55SoPC90aD4NCiAgICAgICAgICAgICAgICAgICAgPHRoPuWIm+W7uuaXtumXtDwvdGg+DQogICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0iY29sLWFjdGlvbnMiPuaTjeS9nDwvdGg+DQogICAgICAgICAgICAgICAgICA8L3RyPg0KICAgICAgICAgICAgICAgIDwvdGhlYWQ+DQogICAgICAgICAgICAgICAgPHRib2R5IGlkPSJwcm9tcHRUYWJsZUJvZHkiPjwvdGJvZHk+DQogICAgICAgICAgICAgIDwvdGFibGU+DQogICAgICAgICAgICA8L2Rpdj4NCiAgICAgICAgICA8L3NlY3Rpb24+DQogICAgICAgIDwvZGl2Pg0KICAgICAgPC9kaXY+DQogICAgICA8ZGl2IGNsYXNzPSJzZXR0aW5ncy1tb2RhbC1mb290Ij4NCiAgICAgICAgPGJ1dHRvbiBjbGFzcz0ic2V0dGluZ3MtYnRuIHByaW1hcnkiIGlkPSJzZXR0aW5nc0NvbmZpcm1CdG4iIHR5cGU9ImJ1dHRvbiI+56Gu5a6aPC9idXR0b24+DQogICAgICAgIDxidXR0b24gY2xhc3M9InNldHRpbmdzLWJ0biIgaWQ9InNldHRpbmdzQ2FuY2VsQnRuIiB0eXBlPSJidXR0b24iPuWPlua2iDwvYnV0dG9uPg0KICAgICAgPC9kaXY+DQogICAgPC9kaXY+DQogIDwvZGl2Pg0KDQogIDxkaXYgY2xhc3M9InNldHRpbmdzLWZvcm0tb3ZlcmxheSIgaWQ9InNldHRpbmdzRm9ybU92ZXJsYXkiIGhpZGRlbj4NCiAgICA8ZGl2IGNsYXNzPSJzZXR0aW5ncy1mb3JtLW1vZGFsIiByb2xlPSJkaWFsb2ciIGFyaWEtbW9kYWw9InRydWUiIGFyaWEtbGFiZWxsZWRieT0ic2V0dGluZ3NGb3JtVGl0bGUiPg0KICAgICAgPGRpdiBjbGFzcz0ic2V0dGluZ3MtZm9ybS1oZWFkIj4NCiAgICAgICAgPGgzIGlkPSJzZXR0aW5nc0Zvcm1UaXRsZSI+5Yib5bu6PC9oMz4NCiAgICAgICAgPGJ1dHRvbiBjbGFzcz0ic2V0dGluZ3MtZm9ybS1jbG9zZSIgaWQ9ImNsb3NlU2V0dGluZ3NGb3JtQnRuIiB0eXBlPSJidXR0b24iIGFyaWEtbGFiZWw9IuWFs+mXrSI+w5c8L2J1dHRvbj4NCiAgICAgIDwvZGl2Pg0KICAgICAgPGRpdiBjbGFzcz0ic2V0dGluZ3MtZm9ybS1ib2R5IiBpZD0ic2V0dGluZ3NGb3JtQm9keSI+PC9kaXY+DQogICAgICA8ZGl2IGNsYXNzPSJzZXR0aW5ncy1mb3JtLWZvb3QiPg0KICAgICAgICA8YnV0dG9uIGNsYXNzPSJzZXR0aW5ncy1idG4gcHJpbWFyeSIgaWQ9InNldHRpbmdzRm9ybVNhdmVCdG4iIHR5cGU9ImJ1dHRvbiI+56Gu5a6aPC9idXR0b24+DQogICAgICAgIDxidXR0b24gY2xhc3M9InNldHRpbmdzLWJ0biIgaWQ9InNldHRpbmdzRm9ybUNhbmNlbEJ0biIgdHlwZT0iYnV0dG9uIj7lj5bmtog8L2J1dHRvbj4NCiAgICAgIDwvZGl2Pg0KICAgIDwvZGl2Pg0KICA8L2Rpdj4NCg=='), c => c.charCodeAt(0))) : decodeURIComponent(escape(atob('PGRpdiBjbGFzcz0ic2V0dGluZ3MtbW9kYWwtb3ZlcmxheSIgaWQ9InNldHRpbmdzTW9kYWxPdmVybGF5IiBoaWRkZW4+DQogICAgPGRpdiBjbGFzcz0ic2V0dGluZ3MtbW9kYWwiIHJvbGU9ImRpYWxvZyIgYXJpYS1tb2RhbD0idHJ1ZSIgYXJpYS1sYWJlbGxlZGJ5PSJzZXR0aW5nc01vZGFsVGl0bGUiPg0KICAgICAgPGRpdiBjbGFzcz0ic2V0dGluZ3MtbW9kYWwtaGVhZCI+DQogICAgICAgIDxoMiBjbGFzcz0ic2V0dGluZ3MtbW9kYWwtdGl0bGUiIGlkPSJzZXR0aW5nc01vZGFsVGl0bGUiPuaZuuiDvemXruaVsOiuvue9rjwvaDI+DQogICAgICAgIDxidXR0b24gY2xhc3M9InNldHRpbmdzLW1vZGFsLWNsb3NlIiBpZD0iY2xvc2VTZXR0aW5nc01vZGFsIiB0eXBlPSJidXR0b24iIGFyaWEtbGFiZWw9IuWFs+mXrSI+w5c8L2J1dHRvbj4NCiAgICAgIDwvZGl2Pg0KICAgICAgPGRpdiBjbGFzcz0ic2V0dGluZ3MtbW9kYWwtYm9keSI+DQogICAgICAgIDxuYXYgY2xhc3M9InNldHRpbmdzLW5hdiIgYXJpYS1sYWJlbD0i6K6+572u5YiG57G7Ij4NCiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJzZXR0aW5ncy1uYXYtaXRlbSBhY3RpdmUiIHR5cGU9ImJ1dHRvbiIgZGF0YS1zZXR0aW5ncy1wYW5lbD0idGVybXMiPuacr+ivremFjee9rjwvYnV0dG9uPg0KICAgICAgICAgIDxidXR0b24gY2xhc3M9InNldHRpbmdzLW5hdi1pdGVtIiB0eXBlPSJidXR0b24iIGRhdGEtc2V0dGluZ3MtcGFuZWw9InNxbCI+U1FM56S65L6L5bqTPC9idXR0b24+DQogICAgICAgICAgPGJ1dHRvbiBjbGFzcz0ic2V0dGluZ3MtbmF2LWl0ZW0iIHR5cGU9ImJ1dHRvbiIgZGF0YS1zZXR0aW5ncy1wYW5lbD0icHJvbXB0Ij7oh6rlrprkuYnmj5DnpLror408L2J1dHRvbj4NCiAgICAgICAgPC9uYXY+DQogICAgICAgIDxkaXYgY2xhc3M9InNldHRpbmdzLWNvbnRlbnQiPg0KICAgICAgICAgIDxzZWN0aW9uIGNsYXNzPSJzZXR0aW5ncy1wYW5lbCBhY3RpdmUiIGRhdGEtc2V0dGluZ3MtcGFuZWw9InRlcm1zIj4NCiAgICAgICAgICAgIDxkaXYgY2xhc3M9InNldHRpbmdzLWFsZXJ0Ij4NCiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9InNldHRpbmdzLWFsZXJ0LWljb24iPmk8L3NwYW4+DQogICAgICAgICAgICAgIDxwPuS8geS4mueUqOaIt+WPr+WcqOatpOWkhOWvueacr+ivrei/m+ihjOeuoeeQhu+8jOW4ruWKqeWkp+aooeWei+abtOWlveWcsOeQhuino+S8geS4muS4muWKoeacr+ivreOAgeS4muWKoemAu+i+keOAgeWtl+auteS/oeaBr++8jOaPkOWNhyBTUUwvTURMIOeUn+aIkOeahOWHhuehruaAp+OAgjwvcD4NCiAgICAgICAgICAgIDwvZGl2Pg0KICAgICAgICAgICAgPGRpdiBjbGFzcz0ic2V0dGluZ3MtdG9vbGJhciI+DQogICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0ic2V0dGluZ3Mtc2VhcmNoLXdyYXAiPg0KICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJzZXR0aW5ncy1zZWFyY2gtaWNvbiI+4oyVPC9zcGFuPg0KICAgICAgICAgICAgICAgIDxpbnB1dCBpZD0idGVybVNlYXJjaElucHV0IiB0eXBlPSJ0ZXh0IiBwbGFjZWhvbGRlcj0i6K+36L6T5YWl5pyv6K+t5ZCN56ewIC8g5ZCM5LmJ6K+NIC8g5o+P6L+wIiAvPg0KICAgICAgICAgICAgICA8L2xhYmVsPg0KICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJzZXR0aW5ncy1idG4gcHJpbWFyeSIgaWQ9InRlcm1DcmVhdGVCdG4iIHR5cGU9ImJ1dHRvbiI+5Yib5bu6PC9idXR0b24+DQogICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9InNldHRpbmdzLWJ0biIgaWQ9InRlcm1CYXRjaERlbGV0ZUJ0biIgdHlwZT0iYnV0dG9uIiBkaXNhYmxlZD7mibnph4/liKDpmaQ8L2J1dHRvbj4NCiAgICAgICAgICAgIDwvZGl2Pg0KICAgICAgICAgICAgPGRpdiBjbGFzcz0ic2V0dGluZ3MtdGFibGUtd3JhcCI+DQogICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz0ic2V0dGluZ3MtdGFibGUiPg0KICAgICAgICAgICAgICAgIDx0aGVhZD4NCiAgICAgICAgICAgICAgICAgIDx0cj4NCiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJjb2wtY2hlY2siPjxpbnB1dCBpZD0idGVybVNlbGVjdEFsbCIgdHlwZT0iY2hlY2tib3giIGFyaWEtbGFiZWw9IuWFqOmAiSIgZGlzYWJsZWQgLz48L3RoPg0KICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9ImNvbC1pbmRleCI+5bqP5Y+3PC90aD4NCiAgICAgICAgICAgICAgICAgICAgPHRoPuacr+ivreWQjeensDwvdGg+DQogICAgICAgICAgICAgICAgICAgIDx0aD7lkIzkuYnor40v5qCH562+PC90aD4NCiAgICAgICAgICAgICAgICAgICAgPHRoPuacr+ivreaPj+i/sDwvdGg+DQogICAgICAgICAgICAgICAgICAgIDx0aD7liJvlu7rkuro8L3RoPg0KICAgICAgICAgICAgICAgICAgICA8dGg+5Yib5bu65pe26Ze0PC90aD4NCiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJjb2wtYWN0aW9ucyI+5pON5L2cPC90aD4NCiAgICAgICAgICAgICAgICAgIDwvdHI+DQogICAgICAgICAgICAgICAgPC90aGVhZD4NCiAgICAgICAgICAgICAgICA8dGJvZHkgaWQ9InRlcm1UYWJsZUJvZHkiPjwvdGJvZHk+DQogICAgICAgICAgICAgIDwvdGFibGU+DQogICAgICAgICAgICA8L2Rpdj4NCiAgICAgICAgICA8L3NlY3Rpb24+DQogICAgICAgICAgPHNlY3Rpb24gY2xhc3M9InNldHRpbmdzLXBhbmVsIiBkYXRhLXNldHRpbmdzLXBhbmVsPSJzcWwiPg0KICAgICAgICAgICAgPGRpdiBjbGFzcz0ic2V0dGluZ3MtYWxlcnQiPg0KICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0ic2V0dGluZ3MtYWxlcnQtaWNvbiI+aTwvc3Bhbj4NCiAgICAgICAgICAgICAgPHA+5Zyo5q2k5YiX6KGo77yM55So5oi35Y+v5Lul566h55CG5ZKM5L+d5a2Y44CM6Zeu6aKYIC0gU1FM44CN56S65L6L5a+544CC6L+Z5Lqb56S65L6L5a+55pyJ5Yqp5LqO6Zeu5pWw5pm66IO95LqG6Kej5b2T5YmN55So5oi357yW5YaZIFNRTCDor63lj6XnmoTmlrnlvI/vvIzku47ogIzog73lpJ/nlJ/miJDmm7TnrKblkIjnlKjmiLfpooTmnJ/nmoTmn6Xor6Lnu5PmnpzjgII8L3A+DQogICAgICAgICAgICA8L2Rpdj4NCiAgICAgICAgICAgIDxkaXYgY2xhc3M9InNldHRpbmdzLXRvb2xiYXIiPg0KICAgICAgICAgICAgICA8bGFiZWwgY2xhc3M9InNldHRpbmdzLXNlYXJjaC13cmFwIj4NCiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz0ic2V0dGluZ3Mtc2VhcmNoLWljb24iPuKMlTwvc3Bhbj4NCiAgICAgICAgICAgICAgICA8aW5wdXQgaWQ9InNxbFNlYXJjaElucHV0IiB0eXBlPSJ0ZXh0IiBwbGFjZWhvbGRlcj0i6K+36L6T5YWl6Zeu6aKY5o+P6L+wIiAvPg0KICAgICAgICAgICAgICA8L2xhYmVsPg0KICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJzZXR0aW5ncy1idG4gcHJpbWFyeSIgaWQ9InNxbENyZWF0ZUJ0biIgdHlwZT0iYnV0dG9uIj7liJvlu7o8L2J1dHRvbj4NCiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0ic2V0dGluZ3MtYnRuIiBpZD0ic3FsQmF0Y2hEZWxldGVCdG4iIHR5cGU9ImJ1dHRvbiIgZGlzYWJsZWQ+5om56YeP5Yig6ZmkPC9idXR0b24+DQogICAgICAgICAgICA8L2Rpdj4NCiAgICAgICAgICAgIDxkaXYgY2xhc3M9InNldHRpbmdzLXRhYmxlLXdyYXAiPg0KICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9InNldHRpbmdzLXRhYmxlIHNxbC10YWJsZSI+DQogICAgICAgICAgICAgICAgPHRoZWFkPg0KICAgICAgICAgICAgICAgICAgPHRyPg0KICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9ImNvbC1jaGVjayI+PGlucHV0IGlkPSJzcWxTZWxlY3RBbGwiIHR5cGU9ImNoZWNrYm94IiBhcmlhLWxhYmVsPSLlhajpgIkiIGRpc2FibGVkIC8+PC90aD4NCiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJjb2wtaW5kZXgiPuW6j+WPtzwvdGg+DQogICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0iY29sLXF1ZXN0aW9uIj7pl67popjmj4/ov7A8L3RoPg0KICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9ImNvbC1zcWwiPuekuuS+i1NRTDwvdGg+DQogICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0iY29sLWRvbWFpbiI+5Lia5Yqh5Z+fPC90aD4NCiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJjb2wtcmVjb21tZW5kIj7orr7nva7kuLrmjqjojZDpl67popg8L3RoPg0KICAgICAgICAgICAgICAgICAgICA8dGg+5Yib5bu65Lq6PC90aD4NCiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJjb2wtYWN0aW9ucyI+5pON5L2cPC90aD4NCiAgICAgICAgICAgICAgICAgIDwvdHI+DQogICAgICAgICAgICAgICAgPC90aGVhZD4NCiAgICAgICAgICAgICAgICA8dGJvZHkgaWQ9InNxbFRhYmxlQm9keSI+PC90Ym9keT4NCiAgICAgICAgICAgICAgPC90YWJsZT4NCiAgICAgICAgICAgIDwvZGl2Pg0KICAgICAgICAgIDwvc2VjdGlvbj4NCiAgICAgICAgICA8c2VjdGlvbiBjbGFzcz0ic2V0dGluZ3MtcGFuZWwiIGRhdGEtc2V0dGluZ3MtcGFuZWw9InByb21wdCI+DQogICAgICAgICAgICA8ZGl2IGNsYXNzPSJzZXR0aW5ncy1hbGVydCI+DQogICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJzZXR0aW5ncy1hbGVydC1pY29uIj5pPC9zcGFuPg0KICAgICAgICAgICAgICA8cD7lnKjmraTliJfooajvvIzmjIfku6TmmK/luK7liqnmjIflr7zpl67mlbDlpoLkvZXnlJ/miJAgU1FMIOafpeivouWSjOWTjeW6lOeahOaMh+WNl+OAguWug+S7rOWFgeiuuOaCqOWumuS5ieS4muWKoeinhOWImeOAgeaVsOaNruaooeWei+eQhuino+WSjOafpeivouaooeW8j++8jOS7peehruS/neeUn+aIkOS4gOiHtOOAgeWHhuehruS4lOespuWQiOaCqOe7hOe7h+eJueWumumcgOaxgueahOe7k+aenOOAgjwvcD4NCiAgICAgICAgICAgIDwvZGl2Pg0KICAgICAgICAgICAgPGRpdiBjbGFzcz0ic2V0dGluZ3MtdG9vbGJhciI+DQogICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz0ic2V0dGluZ3Mtc2VhcmNoLXdyYXAiPg0KICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPSJzZXR0aW5ncy1zZWFyY2gtaWNvbiI+4oyVPC9zcGFuPg0KICAgICAgICAgICAgICAgIDxpbnB1dCBpZD0icHJvbXB0U2VhcmNoSW5wdXQiIHR5cGU9InRleHQiIHBsYWNlaG9sZGVyPSLor7fovpPlhaXmjIfku6TlhoXlrrkiIC8+DQogICAgICAgICAgICAgIDwvbGFiZWw+DQogICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9InNldHRpbmdzLWJ0biBwcmltYXJ5IiBpZD0icHJvbXB0Q3JlYXRlQnRuIiB0eXBlPSJidXR0b24iPuWIm+W7ujwvYnV0dG9uPg0KICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJzZXR0aW5ncy1idG4iIGlkPSJwcm9tcHRCYXRjaERlbGV0ZUJ0biIgdHlwZT0iYnV0dG9uIiBkaXNhYmxlZD7mibnph4/liKDpmaQ8L2J1dHRvbj4NCiAgICAgICAgICAgIDwvZGl2Pg0KICAgICAgICAgICAgPGRpdiBjbGFzcz0ic2V0dGluZ3MtdGFibGUtd3JhcCI+DQogICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz0ic2V0dGluZ3MtdGFibGUgcHJvbXB0LXRhYmxlIj4NCiAgICAgICAgICAgICAgICA8dGhlYWQ+DQogICAgICAgICAgICAgICAgICA8dHI+DQogICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0iY29sLWNoZWNrIj48aW5wdXQgaWQ9InByb21wdFNlbGVjdEFsbCIgdHlwZT0iY2hlY2tib3giIGFyaWEtbGFiZWw9IuWFqOmAiSIgZGlzYWJsZWQgLz48L3RoPg0KICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9ImNvbC1pbmRleCI+5bqP5Y+3PC90aD4NCiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJjb2wtaW5zdHJ1Y3Rpb24iPuaMh+S7pDwvdGg+DQogICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0iY29sLWRvbWFpbiI+5Lia5Yqh5Z+fPC90aD4NCiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPSJjb2wtZW5hYmxlZCI+5ZCv55SoPC90aD4NCiAgICAgICAgICAgICAgICAgICAgPHRoPuWIm+W7uuaXtumXtDwvdGg+DQogICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz0iY29sLWFjdGlvbnMiPuaTjeS9nDwvdGg+DQogICAgICAgICAgICAgICAgICA8L3RyPg0KICAgICAgICAgICAgICAgIDwvdGhlYWQ+DQogICAgICAgICAgICAgICAgPHRib2R5IGlkPSJwcm9tcHRUYWJsZUJvZHkiPjwvdGJvZHk+DQogICAgICAgICAgICAgIDwvdGFibGU+DQogICAgICAgICAgICA8L2Rpdj4NCiAgICAgICAgICA8L3NlY3Rpb24+DQogICAgICAgIDwvZGl2Pg0KICAgICAgPC9kaXY+DQogICAgICA8ZGl2IGNsYXNzPSJzZXR0aW5ncy1tb2RhbC1mb290Ij4NCiAgICAgICAgPGJ1dHRvbiBjbGFzcz0ic2V0dGluZ3MtYnRuIHByaW1hcnkiIGlkPSJzZXR0aW5nc0NvbmZpcm1CdG4iIHR5cGU9ImJ1dHRvbiI+56Gu5a6aPC9idXR0b24+DQogICAgICAgIDxidXR0b24gY2xhc3M9InNldHRpbmdzLWJ0biIgaWQ9InNldHRpbmdzQ2FuY2VsQnRuIiB0eXBlPSJidXR0b24iPuWPlua2iDwvYnV0dG9uPg0KICAgICAgPC9kaXY+DQogICAgPC9kaXY+DQogIDwvZGl2Pg0KDQogIDxkaXYgY2xhc3M9InNldHRpbmdzLWZvcm0tb3ZlcmxheSIgaWQ9InNldHRpbmdzRm9ybU92ZXJsYXkiIGhpZGRlbj4NCiAgICA8ZGl2IGNsYXNzPSJzZXR0aW5ncy1mb3JtLW1vZGFsIiByb2xlPSJkaWFsb2ciIGFyaWEtbW9kYWw9InRydWUiIGFyaWEtbGFiZWxsZWRieT0ic2V0dGluZ3NGb3JtVGl0bGUiPg0KICAgICAgPGRpdiBjbGFzcz0ic2V0dGluZ3MtZm9ybS1oZWFkIj4NCiAgICAgICAgPGgzIGlkPSJzZXR0aW5nc0Zvcm1UaXRsZSI+5Yib5bu6PC9oMz4NCiAgICAgICAgPGJ1dHRvbiBjbGFzcz0ic2V0dGluZ3MtZm9ybS1jbG9zZSIgaWQ9ImNsb3NlU2V0dGluZ3NGb3JtQnRuIiB0eXBlPSJidXR0b24iIGFyaWEtbGFiZWw9IuWFs+mXrSI+w5c8L2J1dHRvbj4NCiAgICAgIDwvZGl2Pg0KICAgICAgPGRpdiBjbGFzcz0ic2V0dGluZ3MtZm9ybS1ib2R5IiBpZD0ic2V0dGluZ3NGb3JtQm9keSI+PC9kaXY+DQogICAgICA8ZGl2IGNsYXNzPSJzZXR0aW5ncy1mb3JtLWZvb3QiPg0KICAgICAgICA8YnV0dG9uIGNsYXNzPSJzZXR0aW5ncy1idG4gcHJpbWFyeSIgaWQ9InNldHRpbmdzRm9ybVNhdmVCdG4iIHR5cGU9ImJ1dHRvbiI+56Gu5a6aPC9idXR0b24+DQogICAgICAgIDxidXR0b24gY2xhc3M9InNldHRpbmdzLWJ0biIgaWQ9InNldHRpbmdzRm9ybUNhbmNlbEJ0biIgdHlwZT0iYnV0dG9uIj7lj5bmtog8L2J1dHRvbj4NCiAgICAgIDwvZGl2Pg0KICAgIDwvZGl2Pg0KICA8L2Rpdj4NCg=='))));

  let deps = { onRecommendChange: null };
  let settingsModalOverlayEl, closeSettingsModalEl, settingsCancelBtnEl, settingsConfirmBtnEl;
  let settingsNavItems, settingsPanels;
  let termSearchInputEl, sqlSearchInputEl, promptSearchInputEl;
  let termTableBodyEl, sqlTableBodyEl, promptTableBodyEl;
  let termCreateBtnEl, sqlCreateBtnEl, promptCreateBtnEl;
  let termBatchDeleteBtnEl, sqlBatchDeleteBtnEl, promptBatchDeleteBtnEl;
  let termSelectAllEl, sqlSelectAllEl, promptSelectAllEl;
  let settingsFormOverlayEl, settingsFormTitleEl, settingsFormBodyEl;
  let closeSettingsFormBtnEl, settingsFormSaveBtnEl, settingsFormCancelBtnEl;
  let initialized = false;

  function renderRecommendStrip() {
    if (typeof deps.onRecommendChange === "function") deps.onRecommendChange();
  }

  function cacheEls() {
    settingsModalOverlayEl = document.getElementById("settingsModalOverlay");
    closeSettingsModalEl = document.getElementById("closeSettingsModal");
    settingsCancelBtnEl = document.getElementById("settingsCancelBtn");
    settingsConfirmBtnEl = document.getElementById("settingsConfirmBtn");
    settingsNavItems = document.querySelectorAll("#settingsModalOverlay .settings-nav-item");
    settingsPanels = document.querySelectorAll("#settingsModalOverlay .settings-panel");
    termSearchInputEl = document.getElementById("termSearchInput");
    sqlSearchInputEl = document.getElementById("sqlSearchInput");
    promptSearchInputEl = document.getElementById("promptSearchInput");
    termTableBodyEl = document.getElementById("termTableBody");
    sqlTableBodyEl = document.getElementById("sqlTableBody");
    promptTableBodyEl = document.getElementById("promptTableBody");
    termCreateBtnEl = document.getElementById("termCreateBtn");
    sqlCreateBtnEl = document.getElementById("sqlCreateBtn");
    promptCreateBtnEl = document.getElementById("promptCreateBtn");
    termBatchDeleteBtnEl = document.getElementById("termBatchDeleteBtn");
    sqlBatchDeleteBtnEl = document.getElementById("sqlBatchDeleteBtn");
    promptBatchDeleteBtnEl = document.getElementById("promptBatchDeleteBtn");
    termSelectAllEl = document.getElementById("termSelectAll");
    sqlSelectAllEl = document.getElementById("sqlSelectAll");
    promptSelectAllEl = document.getElementById("promptSelectAll");
    settingsFormOverlayEl = document.getElementById("settingsFormOverlay");
    settingsFormTitleEl = document.getElementById("settingsFormTitle");
    settingsFormBodyEl = document.getElementById("settingsFormBody");
    closeSettingsFormBtnEl = document.getElementById("closeSettingsFormBtn");
    settingsFormSaveBtnEl = document.getElementById("settingsFormSaveBtn");
    settingsFormCancelBtnEl = document.getElementById("settingsFormCancelBtn");
  }

  function mount(root) {
    if (document.getElementById("settingsModalOverlay")) return;
    const host = root || document.body;
    const wrap = document.createElement("div");
    wrap.innerHTML = typeof SETTINGS_MODAL_HTML === "string" ? SETTINGS_MODAL_HTML : (SETTINGS_MODAL_HTML && SETTINGS_MODAL_HTML.value) || "";
    while (wrap.firstChild) host.appendChild(wrap.firstChild);
  }

  const ASSISTANT_MODEL_TABS = [
    { key: "domain", label: "域模型" },
    { key: "base", label: "基础模型" },
    { key: "pml", label: "PML业务对象" },
  ];

  function getAssistantModelOptions() {
    const models = (typeof global.QueryEngine !== "undefined" && typeof global.QueryEngine.getAllModels === "function")
      ? global.QueryEngine.getAllModels()
      : [];
    return models.map((m) => ({
      value: m.id,
      label: m.name,
      type: "domain",
      draft: Boolean(m.draft),
    }));
  }

  let assistantStore = [];
  let assistantEditingId = null;
  let assistantSelectedModels = new Set();
  let asstModelTab = "domain";
  let asstModelSearchQuery = "";

  const APPKEY_SECRET = "GLD-WENSHU-AK-V1";

  function xorCipher(text, secret) {
    const s = secret || APPKEY_SECRET;
    let out = "";
    for (let i = 0; i < text.length; i += 1) {
      out += String.fromCharCode(text.charCodeAt(i) ^ s.charCodeAt(i % s.length));
    }
    return out;
  }

  function toBase64Url(text) {
    const b64 = btoa(unescape(encodeURIComponent(text)));
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function fromBase64Url(b64url) {
    const padded = b64url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    return decodeURIComponent(escape(atob(padded + pad)));
  }

  /** 由产品 CODE + 产品名称（及助理编码）生成可解密 AppKey */
  function generateAppKey(productCode, productName, asstCode) {
    const pc = String(productCode || "").trim();
    const pn = String(productName || "").trim();
    const ac = String(asstCode || "").trim();
    if (!pc && !pn) return "";
    const raw = ["v1", pc, pn, ac].join("|");
    return `ak_${toBase64Url(xorCipher(raw, APPKEY_SECRET))}`;
  }

  function decryptAppKey(appKey) {
    const key = String(appKey || "").trim();
    if (!key.startsWith("ak_")) return null;
    try {
      const raw = xorCipher(fromBase64Url(key.slice(3)), APPKEY_SECRET);
      const parts = raw.split("|");
      if (parts[0] !== "v1" || parts.length < 3) return null;
      return {
        version: parts[0],
        productCode: parts[1] || "",
        productName: parts[2] || "",
        asstCode: parts[3] || "",
      };
    } catch (e) {
      return null;
    }
  }

  function refreshAppKeyFromProductFields() {
    const productCode = document.getElementById("asstProductCode")?.value.trim() || "";
    const productName = document.getElementById("asstProductName")?.value.trim() || "";
    const asstCode = document.getElementById("asstCode")?.value.trim() || "";
    const el = document.getElementById("asstAppKey");
    if (!el) return "";
    el.value = generateAppKey(productCode, productName, asstCode);
    return el.value;
  }

  function getSeedAssistants() {
    const allIds = getAssistantModelOptions().map((m) => m.value);
    const retailId = allIds.find((id) => id === "model-retail-analytics") || allIds[0] || "";
    const materialId = allIds.find((id) => id === "model-construction-material") || allIds[1] || retailId;
    return [
      { id: "a1", name: "施工问数助理", code: "asst-construction-001", productName: "施工", productCode: "construction", enabled: "on", desc: "面向施工产线的问数助理，绑定模型面板中的建筑物料台账模型。", models: materialId ? [materialId] : [], defaultModel: materialId, llm: "AceGPT", recSql: true, welcome: "你好，我是施工问数助理。可查询物料、入库、出库与库存等数据。", embedMode: "package", theme: "light", appKey: generateAppKey("construction", "施工", "asst-construction-001"), updatedAt: "2026-07-20 14:32" },
      { id: "a2", name: "经营问数助理", code: "asst-retail-001", productName: "经营", productCode: "retail", enabled: "on", desc: "面向经营分析的问数助理，绑定零售经营分析模型。", models: retailId ? [retailId] : [], defaultModel: retailId, llm: "AceGPT", recSql: true, welcome: "你好，我是经营问数助理。", embedMode: "package", theme: "light", appKey: generateAppKey("retail", "经营", "asst-retail-001"), updatedAt: "2026-07-18 09:10" },
      { id: "a3", name: "综合问数助理", code: "asst-all-001", productName: "平台", productCode: "platform", enabled: "off", desc: "绑定模型面板全部业务模型（配置中，暂未启用）。", models: allIds.slice(), defaultModel: retailId || allIds[0] || "", llm: "DeepSeek", recSql: true, welcome: "", embedMode: "iframe", theme: "light", appKey: generateAppKey("platform", "平台", "asst-all-001"), updatedAt: "2026-07-12 16:45" },
      { id: "a4", name: "零售经营助理", code: "asst-design-001", productName: "设计", productCode: "design", enabled: "on", desc: "零售经营指标速览。", models: retailId ? [retailId] : [], defaultModel: retailId, llm: "AceGPT", recSql: true, welcome: "你好，我是零售经营助理。", embedMode: "standalone", theme: "deep-blue", appKey: generateAppKey("design", "设计", "asst-design-001"), updatedAt: "2026-07-08 11:20" },
    ];
  }

  function normalizeEmbedMode(value) {
    if (value === "iframe" || value === "standalone" || value === "package") return value;
    if (value === "embed") return "iframe";
    if (value === "page") return "standalone";
    return "package";
  }

  function buildIframeMenuUrl() {
    const code = document.getElementById("asstCode")?.value.trim() || "assistant-code";
    const appKey = document.getElementById("asstAppKey")?.value.trim() || "";
    const productCode = document.getElementById("asstProductCode")?.value.trim() || "";
    const base = String(location.href || "").replace(/[#?].*$/, "").replace(/[^/]+$/, "");
    const params = new URLSearchParams({
      embed: "iframe",
      assistantCode: code,
    });
    if (productCode) params.set("productCode", productCode);
    let qs = params.toString();
    if (appKey) qs += (qs ? "&" : "") + "appKey=" + encodeURIComponent(appKey);
    return `${base}assistant-iframe.html?${qs}`;
  }

  function syncEmbedModeUI() {
    const mode = normalizeEmbedMode(document.getElementById("asstEmbedMode")?.value);
    const modeSelect = document.getElementById("asstEmbedMode");
    if (modeSelect && modeSelect.value !== mode) modeSelect.value = mode;
    const hint = document.getElementById("asstEmbedModeHint");
    const field = document.getElementById("asstIframeUrlField");
    const urlInput = document.getElementById("asstIframeUrl");
    if (hint) {
      if (mode === "iframe") hint.textContent = "已自动生成菜单 URL，请复制后配置到宿主系统的 iframe 的 src 中使用，已帮您把 AppKey 参数带上，必传，不可删除。";
      else if (mode === "standalone") hint.textContent = "由产线独立研发对接，保持现有助手 UI";
      else hint.textContent = "通过前端包集成贴边助理，保持现有助手 UI";
    }
    if (field) field.hidden = mode !== "iframe";
    if (urlInput && mode === "iframe") urlInput.value = buildIframeMenuUrl();
  }

  async function copyIframeMenuUrl() {
    const urlInput = document.getElementById("asstIframeUrl");
    const tip = document.getElementById("asstIframeUrlTip");
    const url = urlInput?.value || buildIframeMenuUrl();
    if (urlInput) urlInput.value = url;
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        ok = true;
      }
    } catch (e) { /* fallback */ }
    if (!ok && urlInput) {
      urlInput.focus();
      urlInput.select();
      try { ok = document.execCommand("copy"); } catch (e2) { ok = false; }
    }
    if (tip) {
      tip.textContent = ok
        ? "已自动生成菜单 URL，请复制后配置到宿主系统的 iframe 的 src 中使用，已帮您把 AppKey 参数带上，必传，不可删除。"
        : "复制失败，请手动选中 URL 后复制。";
    }
    setAssistantSettingsStatus(ok ? "ok" : "error", ok
      ? "已自动生成菜单 URL，请复制后配置到宿主系统的 iframe 的 src 中使用，已帮您把 AppKey 参数带上，必传，不可删除。"
      : "复制失败，请手动复制菜单 URL。");
  }

  async function copyAppKey() {
    const input = document.getElementById("asstAppKey");
    const value = (input?.value || "").trim() || refreshAppKeyFromProductFields();
    if (input && value) input.value = value;
    if (!value) {
      setAssistantSettingsStatus("error", "请先填写产品 CODE 与产品名称以生成 AppKey。");
      return;
    }
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        ok = true;
      }
    } catch (e) { /* fallback */ }
    if (!ok && input) {
      input.focus();
      input.select();
      try { ok = document.execCommand("copy"); } catch (e2) { ok = false; }
    }
    setAssistantSettingsStatus(ok ? "ok" : "error", ok
      ? "AppKey 已复制，请配置到调用方使用。"
      : "复制失败，请手动选中 AppKey 后复制。");
  }

  function ensureAssistantStore() {
    if (!assistantStore.length) assistantStore = getSeedAssistants();
  }

  function formatNow() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  /** 由助理名称生成编码：英文数字保留为 slug，中文等用稳定哈希，冲突时追加序号 */
  function generateAssistantCodeFromName(name, excludeId) {
    const raw = String(name || "").trim();
    if (!raw) return "";
    const ascii = raw
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "");
    let latin = "";
    for (const ch of ascii) {
      if (/[a-z0-9-]/.test(ch)) latin += ch;
    }
    latin = latin.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
    let base;
    if (latin.length >= 2) {
      base = `asst-${latin}`.slice(0, 48);
    } else {
      let h = 2166136261;
      for (let i = 0; i < raw.length; i += 1) {
        h ^= raw.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      base = `asst-${(h >>> 0).toString(36)}`;
    }
    ensureAssistantStore();
    let code = base;
    let n = 2;
    while (assistantStore.some((a) => a.code === code && a.id !== excludeId)) {
      code = `${base}-${n}`;
      n += 1;
    }
    return code;
  }

  function syncAssistantCodeFromName() {
    const name = document.getElementById("asstName")?.value.trim() || "";
    const codeEl = document.getElementById("asstCode");
    if (!codeEl) return "";
    codeEl.value = generateAssistantCodeFromName(name, assistantEditingId);
    refreshAppKeyFromProductFields();
    return codeEl.value;
  }

  function modelLabel(value) {
    const hit = getAssistantModelOptions().find((m) => m.value === value);
    if (hit) return hit.label;
    if (typeof global.QueryEngine !== "undefined" && global.QueryEngine.getAllModels) {
      const m = global.QueryEngine.getAllModels().find((item) => item.id === value);
      if (m) return m.name;
    }
    return value;
  }

  function getAssistantSettingsPanelHtml() {
    return `
      <section class="settings-panel" data-settings-panel="assistant" id="assistantSettingsPanel">
        <div class="settings-alert">
          <span class="settings-alert-icon">i</span>
          <p>管理已配置的问数助理。每个助理归属产线/产品并绑定可用业务模型，问数仅在绑定模型范围内解析。未绑定模型时不可启用。</p>
        </div>
        <div class="assistant-settings-status" id="assistantSettingsStatus" role="status"></div>

        <div class="assistant-list-view" id="asstListView">
          <div class="settings-toolbar">
            <label class="settings-search-wrap">
              <span class="settings-search-icon">⌕</span>
              <input id="asstSearchInput" type="text" placeholder="搜索助理名称 / 编码 / 产线 / CODE" />
            </label>
            <button class="settings-btn primary" type="button" id="asstCreateBtn">新建助理</button>
          </div>
          <div class="settings-table-wrap assistant-list-table-wrap">
            <table class="settings-table assistant-list-table">
              <thead>
                <tr>
                  <th class="col-index">序号</th>
                  <th>助理名称</th>
                  <th>助理编码</th>
                  <th>产线/产品</th>
                  <th>产品 CODE</th>
                  <th>启用状态</th>
                  <th>绑定模型</th>
                  <th>更新时间</th>
                  <th class="col-actions">操作</th>
                </tr>
              </thead>
              <tbody id="asstTableBody"></tbody>
            </table>
          </div>
        </div>

        <div class="assistant-form-view" id="asstFormView" hidden>
          <div class="assistant-form-head">
            <button class="settings-btn" type="button" id="asstBackBtn">← 返回列表</button>
            <h3 class="assistant-form-title" id="asstFormTitle">编辑助理</h3>
          </div>
          <div class="assistant-settings-scroll">
          <div class="assistant-settings-section">
            <h3 class="assistant-settings-section-title">基本信息</h3>
            <div class="assistant-settings-grid">
              <div class="settings-form-field">
                <label for="asstName">助理名称<span class="required">*</span></label>
                <input id="asstName" type="text" value="" placeholder="请输入助理名称" />
              </div>
              <div class="settings-form-field">
                <label for="asstCode">助理编码<span class="required">*</span></label>
                <input id="asstCode" type="text" value="" placeholder="根据助理名称自动生成" readonly />
                <p class="assistant-settings-hint">根据助理名称自动生成，不可手改</p>
              </div>
              <div class="settings-form-field">
                <label for="asstProductName">所属产线/产品名称<span class="required">*</span></label>
                <input id="asstProductName" type="text" value="" placeholder="请输入产品名称，如：施工、造价" />
                <p class="assistant-settings-hint">支持手动输入，与产线主数据名称对齐</p>
              </div>
              <div class="settings-form-field">
                <label for="asstProductCode">所属产线/产品 CODE<span class="required">*</span></label>
                <input id="asstProductCode" type="text" value="" placeholder="请输入产品 CODE，如：construction" />
                <p class="assistant-settings-hint">系统对接用唯一编码，创建后建议勿随意变更</p>
              </div>
              <div class="settings-form-field">
                <label for="asstEnabled">启用状态<span class="required">*</span></label>
                <select id="asstEnabled">
                  <option value="off">停用</option>
                  <option value="on" selected>启用</option>
                </select>
              </div>
              <div class="settings-form-field span-2">
                <label for="asstDesc">说明</label>
                <textarea id="asstDesc" placeholder="给管理员的说明（可选）"></textarea>
              </div>
            </div>
          </div>

          <div class="assistant-settings-section">
            <h3 class="assistant-settings-section-title">业务模型绑定<span class="required">*</span></h3>
            <p class="assistant-settings-hint" style="margin-top:0;margin-bottom:10px;">按「域模型 / 基础模型 / PML业务对象」分类勾选；至少绑定 1 个，且默认模型须在已选列表中。</p>
            <div class="model-bind-panel" id="asstModelBindPanel">
              <div class="model-bind-tabs" role="tablist" aria-label="模型分类">
                <button type="button" class="model-bind-tab active" role="tab" aria-selected="true" data-model-tab="domain">域模型<span class="model-bind-tab-count" data-count-for="domain">0</span></button>
                <button type="button" class="model-bind-tab" role="tab" aria-selected="false" data-model-tab="base">基础模型<span class="model-bind-tab-count" data-count-for="base">0</span></button>
                <button type="button" class="model-bind-tab" role="tab" aria-selected="false" data-model-tab="pml">PML业务对象<span class="model-bind-tab-count" data-count-for="pml">0</span></button>
              </div>
              <div class="model-bind-toolbar">
                <label class="settings-search-wrap model-bind-search">
                  <span class="settings-search-icon">⌕</span>
                  <input id="asstModelSearch" type="text" placeholder="搜索当前分类下的模型名称" />
                </label>
                <span class="model-bind-selected-summary" id="asstModelSelectedSummary">已选 0 项</span>
              </div>
              <div class="model-bind-list" id="asstModelList" role="group" aria-label="可用业务模型"></div>
            </div>
            <div class="assistant-settings-grid" style="margin-top:14px;">
              <div class="settings-form-field">
                <label for="asstDefaultModel">默认业务模型<span class="required">*</span></label>
                <select id="asstDefaultModel">
                  <option value="">请先勾选可用模型</option>
                </select>
              </div>
            </div>
          </div>

          <div class="assistant-settings-section">
            <h3 class="assistant-settings-section-title">问数体验</h3>
            <div class="assistant-settings-grid">
              <div class="settings-form-field">
                <label for="asstScenario">默认业务场景</label>
                <select id="asstScenario">
                  <option value="analytics" selected>经营指标分析</option>
                  <option value="detail">明细台账查询</option>
                  <option value="metadata">数据资产认知</option>
                  <option value="kpi">核心指标速览</option>
                </select>
              </div>
              <div class="settings-form-field">
                <label for="asstLlm">默认大模型</label>
                <select id="asstLlm">
                  <option value="AceGPT" selected>AceGPT</option>
                  <option value="DeepSeek">DeepSeek</option>
                  <option value="gpt-4o">gpt-4o</option>
                </select>
              </div>
              <div class="settings-form-field span-2">
                <label>推荐问句来源</label>
                <div style="display:flex;flex-wrap:wrap;gap:12px 18px;padding-top:6px;font-size:13px;color:#344054;">
                  <label style="display:inline-flex;align-items:center;gap:6px;opacity:0.85;white-space:nowrap;"><input type="checkbox" id="asstRecSql" checked disabled /> SQL 示例推荐</label>
                </div>
                <p class="assistant-settings-hint">固定来源，默认勾选且不可取消</p>
              </div>
              <div class="settings-form-field span-2">
                <label for="asstWelcome">欢迎语文案</label>
                <textarea id="asstWelcome" placeholder="可空则使用系统默认"></textarea>
              </div>
            </div>
          </div>

          <div class="assistant-settings-section">
            <h3 class="assistant-settings-section-title">嵌入与调用</h3>
            <div class="assistant-settings-grid">
              <div class="settings-form-field">
                <label for="asstEmbedMode">嵌入方式</label>
                <select id="asstEmbedMode">
                  <option value="package" selected>前端包引用</option>
                  <option value="iframe">iframe嵌套</option>
                  <option value="standalone">独立研发</option>
                </select>
                <p class="assistant-settings-hint" id="asstEmbedModeHint">通过前端包集成贴边助理，保持现有助手 UI</p>
              </div>
              <div class="settings-form-field">
                <label for="asstTheme">默认主题</label>
                <select id="asstTheme">
                  <option value="light" selected>浅色</option>
                  <option value="deep-blue">深蓝</option>
                </select>
              </div>
              <div class="settings-form-field span-2" id="asstIframeUrlField" hidden>
                <label for="asstIframeUrl">菜单 URL</label>
                <div class="asst-appkey-row">
                  <input id="asstIframeUrl" type="text" value="" readonly placeholder="选择 iframe 嵌套后自动生成" />
                  <button class="settings-btn" type="button" id="asstIframeUrlCopyBtn">复制</button>
                </div>
                <p class="asst-iframe-url-tip" id="asstIframeUrlTip">已自动生成菜单 URL，请复制后配置到宿主系统的 iframe 的 src 中使用，已帮您把 AppKey 参数带上，必传，不可删除。</p>
              </div>
              <div class="settings-form-field span-2">
                <label>右上角操作按钮</label>
                <div class="asst-header-actions" style="display:flex;flex-wrap:wrap;gap:12px 18px;padding-top:6px;font-size:13px;color:#344054;">
                  <label style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap;"><input type="checkbox" id="asstHeaderExpand" /> 全屏（电脑布局）</label>
                  <label style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap;"><input type="checkbox" id="asstHeaderTheme" /> 主题切换</label>
                  <label style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap;"><input type="checkbox" id="asstHeaderSettings" /> 助理设置</label>
                  <label style="display:inline-flex;align-items:center;gap:6px;opacity:0.85;white-space:nowrap;"><input type="checkbox" id="asstHeaderNewChat" checked disabled /> 新建会话</label>
                </div>
                <p class="assistant-settings-hint">勾选后在助理面板右上角展示对应入口；「新建会话」默认开启且不可取消</p>
              </div>
              <div class="settings-form-field span-2">
                <label for="asstAppKey">调用凭证 AppKey</label>
                <div class="asst-appkey-row">
                  <input id="asstAppKey" type="text" value="" readonly placeholder="填写产品 CODE 与名称后自动生成" />
                  <button class="settings-btn" type="button" id="asstAppKeyCopyBtn">复制</button>
                </div>
                <p class="assistant-settings-hint">由「产品 CODE + 产品名称 + 助理编码」加密自动生成，仅支持复制，不可修改；更改产品信息后请重新复制并更新配置</p>
              </div>
            </div>
          </div>

          <div class="assistant-settings-actions">
            <button class="settings-btn" type="button" id="asstCancelEditBtn">取消</button>
            <button class="settings-btn primary" type="button" id="asstSaveBtn">保存</button>
          </div>
          </div>
        </div>
      </section>
    `;
  }

  function ensureAssistantSettingsPanel() {
    const overlay = document.getElementById("settingsModalOverlay");
    if (!overlay) return;
    const nav = overlay.querySelector(".settings-nav");
    const content = overlay.querySelector(".settings-content");
    if (!nav || !content) return;

    if (!nav.querySelector('[data-settings-panel="assistant"]')) {
      const btn = document.createElement("button");
      btn.className = "settings-nav-item";
      btn.type = "button";
      btn.dataset.settingsPanel = "assistant";
      btn.textContent = "助理设置";
      nav.appendChild(btn);
    }

    if (!document.getElementById("assistantSettingsPanel")) {
      content.insertAdjacentHTML("beforeend", getAssistantSettingsPanelHtml());
    }
    ensureAssistantStore();
  }

  function showAssistantListView() {
    const listView = document.getElementById("asstListView");
    const formView = document.getElementById("asstFormView");
    if (listView) listView.hidden = false;
    if (formView) formView.hidden = true;
    assistantEditingId = null;
    renderAssistantTable();
  }

  function showAssistantFormView(mode) {
    const listView = document.getElementById("asstListView");
    const formView = document.getElementById("asstFormView");
    const title = document.getElementById("asstFormTitle");
    if (listView) listView.hidden = true;
    if (formView) formView.hidden = false;
    if (title) title.textContent = mode === "create" ? "新建助理" : "编辑助理";
  }

  function renderAssistantTable() {
    ensureAssistantStore();
    const tbody = document.getElementById("asstTableBody");
    if (!tbody) return;
    const q = (document.getElementById("asstSearchInput")?.value || "").trim().toLowerCase();
    const rows = assistantStore.filter((item) => {
      if (!q) return true;
      return [item.name, item.code, item.productName, item.productCode]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="9" class="assistant-list-empty">暂无匹配的问数助理</td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map((item, idx) => {
      const modelText = (item.models || []).map(modelLabel).join("、") || "—";
      const statusClass = item.enabled === "on" ? "is-on" : "is-off";
      const statusText = item.enabled === "on" ? "启用" : "停用";
      const toggleText = item.enabled === "on" ? "停用" : "启用";
      return `
        <tr data-asst-id="${item.id}">
          <td class="col-index">${idx + 1}</td>
          <td>${escapeHtml(item.name)}</td>
          <td><code class="assistant-code">${escapeHtml(item.code)}</code></td>
          <td>${escapeHtml(item.productName)}</td>
          <td><code class="assistant-code">${escapeHtml(item.productCode)}</code></td>
          <td><span class="assistant-status-tag ${statusClass}">${statusText}</span></td>
          <td title="${escapeHtml(modelText)}">${escapeHtml(modelText)}</td>
          <td>${escapeHtml(item.updatedAt || "—")}</td>
          <td class="col-actions">
            <div class="settings-actions">
              <button class="settings-action-link" type="button" data-asst-action="edit" data-asst-id="${item.id}">编辑</button>
              <span class="settings-action-divider">|</span>
              <button class="settings-action-link" type="button" data-asst-action="toggle" data-asst-id="${item.id}">${toggleText}</button>
            </div>
          </td>
        </tr>`;
    }).join("");
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalizeAssistantHeaderActions(raw) {
    const src = raw && typeof raw === "object" ? raw : {};
    return {
      expand: Boolean(src.expand),
      theme: Boolean(src.theme),
      settings: Boolean(src.settings),
      newChat: true,
    };
  }

  function fillAssistantForm(data) {
    const setVal = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.value = value ?? "";
    };
    const setChecked = (id, checked) => {
      const el = document.getElementById(id);
      if (el) el.checked = Boolean(checked);
    };
    setVal("asstName", data?.name || "");
    syncAssistantCodeFromName();
    setVal("asstProductName", data?.productName || "");
    setVal("asstProductCode", data?.productCode || "");
    setVal("asstEnabled", data?.enabled || "on");
    setVal("asstDesc", data?.desc || "");
    setVal("asstScenario", data?.scenario || "analytics");
    setVal("asstLlm", data?.llm || "AceGPT");
    setChecked("asstRecSql", true);
    setVal("asstWelcome", data?.welcome || "");
    setVal("asstEmbedMode", normalizeEmbedMode(data?.embedMode || "package"));
    setVal("asstTheme", data?.theme || "light");
    const headerActions = normalizeAssistantHeaderActions(data?.headerActions);
    setChecked("asstHeaderExpand", headerActions.expand);
    setChecked("asstHeaderTheme", headerActions.theme);
    setChecked("asstHeaderSettings", headerActions.settings);
    setChecked("asstHeaderNewChat", true);
    const newChatEl = document.getElementById("asstHeaderNewChat");
    if (newChatEl) { newChatEl.checked = true; newChatEl.disabled = true; }
    refreshAppKeyFromProductFields();
    syncEmbedModeUI();

    assistantSelectedModels = new Set((data?.models || []).filter((v) => {
      const opt = getAssistantModelOptions().find((m) => m.value === v);
      return opt && !opt.draft;
    }));
    asstModelTab = "domain";
    asstModelSearchQuery = "";
    const searchInput = document.getElementById("asstModelSearch");
    if (searchInput) searchInput.value = "";
    syncAssistantModelUI();
    if (data?.defaultModel && assistantSelectedModels.has(data.defaultModel)) {
      const defaultSelect = document.getElementById("asstDefaultModel");
      if (defaultSelect) defaultSelect.value = data.defaultModel;
    }
  }

  function collectAssistantForm() {
    return {
      name: document.getElementById("asstName")?.value.trim() || "",
      code: syncAssistantCodeFromName() || document.getElementById("asstCode")?.value.trim() || "",
      productName: document.getElementById("asstProductName")?.value.trim() || "",
      productCode: document.getElementById("asstProductCode")?.value.trim() || "",
      enabled: document.getElementById("asstEnabled")?.value || "off",
      desc: document.getElementById("asstDesc")?.value.trim() || "",
      models: [...assistantSelectedModels],
      defaultModel: document.getElementById("asstDefaultModel")?.value || "",
      scenario: document.getElementById("asstScenario")?.value || "analytics",
      llm: document.getElementById("asstLlm")?.value || "AceGPT",
      recSql: true,
      welcome: document.getElementById("asstWelcome")?.value.trim() || "",
      embedMode: normalizeEmbedMode(document.getElementById("asstEmbedMode")?.value || "package"),
      theme: document.getElementById("asstTheme")?.value || "light",
      headerActions: {
        expand: !!document.getElementById("asstHeaderExpand")?.checked,
        theme: !!document.getElementById("asstHeaderTheme")?.checked,
        settings: !!document.getElementById("asstHeaderSettings")?.checked,
        newChat: true,
      },
      appKey: refreshAppKeyFromProductFields() || document.getElementById("asstAppKey")?.value || "",
      embedIframeUrl: normalizeEmbedMode(document.getElementById("asstEmbedMode")?.value || "package") === "iframe"
        ? buildIframeMenuUrl()
        : "",
    };
  }

  function openCreateAssistant() {
    assistantEditingId = null;
    fillAssistantForm({
      enabled: "on",
      models: [],
      scenario: "analytics",
      llm: "AceGPT",
      recSql: true,
      embedMode: "package",
      theme: "light",
      headerActions: { expand: false, theme: false, settings: false, newChat: true },
      appKey: "",
    });
    setAssistantSettingsStatus("", "");
    showAssistantFormView("create");
  }

  function openEditAssistant(id) {
    ensureAssistantStore();
    const item = assistantStore.find((a) => a.id === id);
    if (!item) return;
    assistantEditingId = id;
    fillAssistantForm(item);
    setAssistantSettingsStatus("", "");
    showAssistantFormView("edit");
  }

  function toggleAssistantEnabled(id) {
    ensureAssistantStore();
    const item = assistantStore.find((a) => a.id === id);
    if (!item) return;
    if (item.enabled !== "on" && !(item.models || []).length) {
      setAssistantSettingsStatus("error", "该助理未绑定业务模型，无法启用。请先编辑并绑定模型。");
      return;
    }
    item.enabled = item.enabled === "on" ? "off" : "on";
    item.updatedAt = formatNow();
    setAssistantSettingsStatus("ok", `已${item.enabled === "on" ? "启用" : "停用"}「${item.name}」。`);
    renderAssistantTable();
  }

  function renderModelBindList() {
    const list = document.getElementById("asstModelList");
    if (!list) return;
    const options = getAssistantModelOptions();
    const q = (asstModelSearchQuery || "").trim().toLowerCase();
    const tabItems = options.filter((m) => (m.type || "domain") === asstModelTab);
    const items = tabItems.filter((m) => {
      if (!q) return true;
      return String(m.label || "").toLowerCase().includes(q);
    });

    document.querySelectorAll(".model-bind-tab").forEach((tab) => {
      const key = tab.dataset.modelTab;
      const active = key === asstModelTab;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
      const countEl = document.querySelector('.model-bind-tab-count[data-count-for="' + key + '"]');
      if (countEl) {
        const count = options.filter((m) => (m.type || "domain") === key && assistantSelectedModels.has(m.value)).length;
        countEl.textContent = String(count);
        countEl.hidden = count === 0;
      }
    });

    const summary = document.getElementById("asstModelSelectedSummary");
    if (summary) summary.textContent = "已选 " + assistantSelectedModels.size + " 项";

    if (!tabItems.length) {
      list.innerHTML = '<div class="model-bind-empty">当前分类暂无模型</div>';
      return;
    }
    if (!items.length) {
      list.innerHTML = '<div class="model-bind-empty">没有匹配结果，请调整搜索关键词</div>';
      return;
    }

    list.innerHTML = items.map((m) => {
      const checked = assistantSelectedModels.has(m.value);
      const disabled = Boolean(m.draft);
      return '<label class="model-bind-item' + (checked ? " is-checked" : "") + (disabled ? " is-disabled" : "") + '">' +
        '<input type="checkbox" name="asstModels" value="' + m.value + '" data-label="' + escapeHtml(m.label) + '" ' + (checked ? "checked " : "") + (disabled ? "disabled " : "") + '/>' +
        '<div class="model-bind-meta"><div class="model-bind-name" title="' + escapeHtml(m.label) + '">' + escapeHtml(m.label) + '</div></div></label>';
    }).join("");
  }

  function syncAssistantModelUI() {
    const defaultSelect = document.getElementById("asstDefaultModel");
    if (!defaultSelect) return;
    const options = getAssistantModelOptions();
    const selected = options.filter((m) => assistantSelectedModels.has(m.value));
    const prev = defaultSelect.value;
    defaultSelect.innerHTML = selected.length
      ? selected.map((m) => '<option value="' + m.value + '">' + escapeHtml(m.label) + "</option>").join("")
      : '<option value="">请先勾选可用模型</option>';
    if (selected.some((m) => m.value === prev)) defaultSelect.value = prev;
    renderModelBindList();
  }


  function setAssistantSettingsStatus(type, message) {
    const el = document.getElementById("assistantSettingsStatus");
    if (!el) return;
    el.className = `assistant-settings-status${type ? ` is-${type}` : ""}`;
    el.textContent = message || "";
  }

  function validateAndSaveAssistantSettings() {
    const form = collectAssistantForm();
    if (!form.name || !form.code) {
      setAssistantSettingsStatus("error", "请填写助理名称与助理编码。");
      return false;
    }
    if (!form.productName || !form.productCode) {
      setAssistantSettingsStatus("error", "请填写所属产线/产品名称与产品 CODE。");
      return false;
    }
    const dup = assistantStore.find((a) => a.code === form.code && a.id !== assistantEditingId);
    if (dup) {
      setAssistantSettingsStatus("error", "助理编码已存在，请更换唯一编码。");
      return false;
    }
    if (!form.models.length) {
      setAssistantSettingsStatus("error", "请至少绑定一个已发布业务模型，否则不可启用问数。");
      if (form.enabled === "on") document.getElementById("asstEnabled").value = "off";
      return false;
    }
    if (!form.defaultModel || !form.models.includes(form.defaultModel)) {
      setAssistantSettingsStatus("error", "默认业务模型必须在已勾选的可用模型列表中。");
      return false;
    }

    ensureAssistantStore();
    if (assistantEditingId) {
      const idx = assistantStore.findIndex((a) => a.id === assistantEditingId);
      if (idx >= 0) {
        assistantStore[idx] = {
          ...assistantStore[idx],
          ...form,
          id: assistantEditingId,
          appKey: form.appKey || generateAppKey(form.productCode, form.productName, form.code),
          updatedAt: formatNow(),
        };
      }
    } else {
      assistantStore.unshift({
        ...form,
        id: `a${Date.now()}`,
        appKey: form.appKey || generateAppKey(form.productCode, form.productName, form.code),
        updatedAt: formatNow(),
      });
    }

    const defaultLabel = modelLabel(form.defaultModel);
    if (form.enabled === "on") {
      setAssistantSettingsStatus("ok", `已保存并启用：将在 ${form.models.length} 个业务模型范围内问数（默认：${defaultLabel}）。`);
    } else {
      setAssistantSettingsStatus("ok", "已保存（当前为停用）。启用前请确保已绑定可用业务模型。");
    }
    showAssistantListView();
    return true;
  }

  function bindAssistantSettingsEvents() {
    ensureAssistantStore();
    const panel = document.getElementById("assistantSettingsPanel");
    if (!panel || panel.dataset.bound === "1") {
      renderAssistantTable();
      return;
    }
    panel.dataset.bound = "1";

    panel.addEventListener("change", (e) => {
      if (e.target.matches('#asstModelList input[name="asstModels"]')) {
        const value = e.target.value;
        if (e.target.checked) assistantSelectedModels.add(value);
        else assistantSelectedModels.delete(value);
        syncAssistantModelUI();
      }
      if (e.target.id === "asstEmbedMode") syncEmbedModeUI();
      if (e.target.id === "asstProductCode" || e.target.id === "asstProductName" || e.target.id === "asstCode" || e.target.id === "asstName") {
        if (e.target.id === "asstName") syncAssistantCodeFromName();
        refreshAppKeyFromProductFields();
        syncEmbedModeUI();
      }
    });
    panel.addEventListener("input", (e) => {
      if (e.target.id === "asstSearchInput") renderAssistantTable();
      if (e.target.id === "asstModelSearch") {
        asstModelSearchQuery = e.target.value || "";
        renderModelBindList();
      }
      if (e.target.id === "asstName") syncAssistantCodeFromName();
      if (e.target.id === "asstProductCode" || e.target.id === "asstProductName" || e.target.id === "asstCode" || e.target.id === "asstName") {
        refreshAppKeyFromProductFields();
        syncEmbedModeUI();
      }
    });
    panel.addEventListener("click", (e) => {
      if (e.target.closest("#asstIframeUrlCopyBtn")) {
        copyIframeMenuUrl();
        return;
      }
      if (e.target.closest("#asstAppKeyCopyBtn")) {
        copyAppKey();
        return;
      }
      const tabBtn = e.target.closest("[data-model-tab]");
      if (tabBtn && tabBtn.closest(".model-bind-tabs")) {
        asstModelTab = tabBtn.dataset.modelTab || "domain";
        asstModelSearchQuery = "";
        const searchInput = document.getElementById("asstModelSearch");
        if (searchInput) searchInput.value = "";
        renderModelBindList();
        return;
      }
      const btn = e.target.closest("[data-asst-action]");
      if (btn) {
        const id = btn.dataset.asstId;
        if (btn.dataset.asstAction === "edit") openEditAssistant(id);
        if (btn.dataset.asstAction === "toggle") toggleAssistantEnabled(id);
        return;
      }
      if (e.target.closest("#asstCreateBtn")) openCreateAssistant();
      if (e.target.closest("#asstBackBtn") || e.target.closest("#asstCancelEditBtn")) {
        setAssistantSettingsStatus("", "");
        showAssistantListView();
      }
      if (e.target.closest("#asstSaveBtn")) validateAndSaveAssistantSettings();
    });

    showAssistantListView();
  }

  function init(options) {
    deps = options || {};
    mount(deps.root);
    ensureAssistantSettingsPanel();
    cacheEls();
    if (initialized) {
      bindAssistantSettingsEvents();
      return api;
    }
    initialized = true;
    function openSettingsModal() {
      settingsModalOverlayEl.hidden = false;
      document.body.style.overflow = "hidden";
    }

    function closeSettingsModal() {
      closeSettingsForm();
      settingsModalOverlayEl.hidden = true;
      document.body.style.overflow = "";
    }

    function switchSettingsPanel(panelKey) {
      document.querySelectorAll("#settingsModalOverlay .settings-nav-item").forEach((item) => {
        item.classList.toggle("active", item.dataset.settingsPanel === panelKey);
      });
      document.querySelectorAll("#settingsModalOverlay .settings-panel").forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.settingsPanel === panelKey);
      });
    }

    const SETTINGS_PANEL_CONFIG = {
      terms: {
        label: "术语",
        storeKey: "terms",
        searchInput: () => termSearchInputEl,
        tableBody: () => termTableBodyEl,
        selectAll: () => termSelectAllEl,
        batchDeleteBtn: () => termBatchDeleteBtnEl,
        colspan: 8,
        searchFields: ["name", "synonyms", "description"],
      },
      sql: {
        label: "SQL 示例",
        storeKey: "sql",
        searchInput: () => sqlSearchInputEl,
        tableBody: () => sqlTableBodyEl,
        selectAll: () => sqlSelectAllEl,
        batchDeleteBtn: () => sqlBatchDeleteBtnEl,
        colspan: 8,
        searchFields: ["question", "sql", "domain"],
      },
      prompt: {
        label: "指令",
        storeKey: "prompt",
        searchInput: () => promptSearchInputEl,
        tableBody: () => promptTableBodyEl,
        selectAll: () => promptSelectAllEl,
        batchDeleteBtn: () => promptBatchDeleteBtnEl,
        colspan: 7,
        searchFields: ["instruction", "domain"],
      },
    };

    const settingsData = {
      terms: [],
      sql: [],
      prompt: [],
    };

    const settingsSelection = {
      terms: new Set(),
      sql: new Set(),
      prompt: new Set(),
    };

    let settingsFormType = null;
    let settingsFormEditingId = null;

    function escapeHtml(value) {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function createSettingsId() {
      return `settings-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function formatSettingsDate(date = new Date()) {
      const pad = (num) => String(num).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    function pickRandomCount(min, max) {
      return min + Math.floor(Math.random() * (max - min + 1));
    }

    function pickRandomItems(pool, count) {
      const copy = [...pool];
      const picked = [];
      while (picked.length < count && copy.length) {
        const index = Math.floor(Math.random() * copy.length);
        picked.push(copy.splice(index, 1)[0]);
      }
      return picked;
    }

    function randomSettingsPastDate(daysBackMax = 45) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * daysBackMax));
      date.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);
      return date;
    }

    const SETTINGS_TERM_POOL = [
      { name: "合同额", synonyms: "合同金额, 签约额", description: "统计周期内签订的合同总金额，按签订日期归属。" },
      { name: "销售量", synonyms: "销量, 销售数量", description: "商品销售的总数量，通常按门店与产品种类汇总。" },
      { name: "GMV", synonyms: "成交总额, 成交额", description: "成交订单金额合计，包含优惠前销售金额。" },
      { name: "交易月份", synonyms: "月份, 业务月", description: "按交易发生时间归集的月份维度，用于趋势分析。" },
      { name: "产品种类", synonyms: "品类, 商品类别", description: "咖啡产品的分类维度，如美式、拿铁、卡布奇诺等。" },
      { name: "门店编号", synonyms: "门店ID, 店铺编号", description: "门店唯一标识，用于关联区域与经营数据。" },
      { name: "订单金额", synonyms: "销售额, 营收", description: "订单实际成交金额，可按区域、月份等维度聚合。" },
      { name: "签订日期", synonyms: "签约日期, 合同日期", description: "合同正式签订的日期，用于合同类指标统计。" },
    ];

    const SETTINGS_SQL_POOL = [
      {
        question: "每交易时间按月、产品种类查看销售量",
        sql: "SELECT 交易月份, 产品种类, SUM(销售量) AS 销售量\nFROM gdcp_dw.coffee_sales_fact\nGROUP BY 交易月份, 产品种类\nORDER BY 交易月份, 销售量 DESC",
        domain: "销售分析",
        recommend: true,
      },
      {
        question: "今年各月销售趋势如何",
        sql: "SELECT 交易月份, SUM(订单金额) AS 订单金额\nFROM gdcp_dw.coffee_sales_fact\nWHERE 交易月份 >= '2025-01'\nGROUP BY 交易月份\nORDER BY 交易月份",
        domain: "销售分析",
        recommend: true,
      },
      {
        question: "帮我查一下今年每个部门的合同额",
        sql: "SELECT belong_dept_name AS `所属部门`, SUM(contract_amount_total) AS `合同额`\nFROM gdcp_dw.contract_master\nWHERE YEAR(sign_date) = YEAR(CURRENT_DATE)\nGROUP BY belong_dept_name\nORDER BY `合同额` DESC",
        domain: "合同管理",
        recommend: false,
      },
      {
        question: "销售量最高的产品种类是哪些",
        sql: "SELECT 产品种类, SUM(销售量) AS 销售量\nFROM gdcp_dw.coffee_sales_fact\nGROUP BY 产品种类\nORDER BY 销售量 DESC\nLIMIT 10",
        domain: "销售分析",
        recommend: true,
      },
      {
        question: "按区域名称统计订单金额",
        sql: "SELECT 区域名称, SUM(订单金额) AS 订单金额\nFROM gdcp_dw.coffee_sales_fact\nGROUP BY 区域名称\nORDER BY 订单金额 DESC",
        domain: "销售分析",
        recommend: false,
      },
      {
        question: "近六个月销售量环比变化",
        sql: "SELECT 交易月份, SUM(销售量) AS 销售量\nFROM gdcp_dw.coffee_sales_fact\nWHERE 交易月份 >= DATE_FORMAT(DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH), '%Y-%m')\nGROUP BY 交易月份\nORDER BY 交易月份",
        domain: "销售分析",
        recommend: false,
      },
      {
        question: "帮我查一下今年每个省份的合同额",
        sql: "SELECT 省份, SUM(合同额) AS 合同额\nFROM gdcp_dw.contract_master\nWHERE YEAR(签订日期) = YEAR(CURRENT_DATE)\nGROUP BY 省份\nORDER BY 合同额 DESC",
        domain: "合同管理",
        recommend: false,
      },
      {
        question: "查询今年各项目中，入库金额超过该物料全公司平均入库金额2倍的物料有哪些？",
        sql: "SELECT i.project_code, m.material_name, SUM(i.inbound_amount) AS `入库金额`\nFROM gdcp_dw.cm_inbound_ledger i\nINNER JOIN gdcp_dw.cm_material_master m ON i.material_code = m.material_code\nWHERE YEAR(i.inbound_date) = YEAR(CURRENT_DATE)\nGROUP BY i.project_code, i.material_code, m.material_name\nHAVING SUM(i.inbound_amount) > (\n  SELECT AVG(sub.`平均金额`) * 2\n  FROM (\n    SELECT material_code, AVG(inbound_amount) AS `平均金额`\n    FROM gdcp_dw.cm_inbound_ledger\n    WHERE YEAR(inbound_date) = YEAR(CURRENT_DATE)\n    GROUP BY material_code\n  ) sub\n  WHERE sub.material_code = i.material_code\n)\nORDER BY `入库金额` DESC",
        domain: "建筑行业物料台账",
        recommend: true,
      },
      {
        question: "哪些项目存在出库金额大于同项目同物料入库金额50%的领用情况？",
        sql: "SELECT o.project_code, p.project_name, o.material_code, m.material_name,\n  SUM(o.outbound_amount) AS `出库金额`,\n  (\n    SELECT SUM(i.inbound_amount)\n    FROM gdcp_dw.cm_inbound_ledger i\n    WHERE i.project_code = o.project_code\n      AND i.material_code = o.material_code\n      AND YEAR(i.inbound_date) = YEAR(CURRENT_DATE)\n  ) AS `入库金额`\nFROM gdcp_dw.cm_outbound_ledger o\nINNER JOIN gdcp_dw.cm_project_site p ON o.project_code = p.project_code\nINNER JOIN gdcp_dw.cm_material_master m ON o.material_code = m.material_code\nWHERE YEAR(o.outbound_date) = YEAR(CURRENT_DATE)\nGROUP BY o.project_code, p.project_name, o.material_code, m.material_name\nHAVING SUM(o.outbound_amount) > (\n  SELECT SUM(i.inbound_amount) * 0.5\n  FROM gdcp_dw.cm_inbound_ledger i\n  WHERE i.project_code = o.project_code\n    AND i.material_code = o.material_code\n    AND YEAR(i.inbound_date) = YEAR(CURRENT_DATE)\n)\nORDER BY `出库金额` DESC",
        domain: "建筑行业物料台账",
        recommend: true,
      },
      {
        question: "统计各物料分类下，本年入库金额排名前3的供应商及其供货项目数量",
        sql: "SELECT m.material_category, s.supplier_name, SUM(i.inbound_amount) AS `入库金额`,\n  COUNT(DISTINCT i.project_code) AS `项目数`\nFROM gdcp_dw.cm_inbound_ledger i\nINNER JOIN gdcp_dw.cm_material_master m ON i.material_code = m.material_code\nINNER JOIN gdcp_dw.cm_supplier s ON i.supplier_code = s.supplier_code\nWHERE YEAR(i.inbound_date) = YEAR(CURRENT_DATE)\n  AND (m.material_category, i.supplier_code) IN (\n    SELECT material_category, supplier_code\n    FROM (\n      SELECT m2.material_category, i2.supplier_code,\n        ROW_NUMBER() OVER (PARTITION BY m2.material_category ORDER BY SUM(i2.inbound_amount) DESC) AS rn\n      FROM gdcp_dw.cm_inbound_ledger i2\n      INNER JOIN gdcp_dw.cm_material_master m2 ON i2.material_code = m2.material_code\n      WHERE YEAR(i2.inbound_date) = YEAR(CURRENT_DATE)\n      GROUP BY m2.material_category, i2.supplier_code\n    ) ranked\n    WHERE ranked.rn <= 3\n  )\nGROUP BY m.material_category, s.supplier_name\nORDER BY m.material_category, inbound_amount DESC",
        domain: "建筑行业物料台账",
        recommend: true,
      },
      {
        question: "查找最新库存快照中，库存金额高于所在省份其他项目平均库存金额的项目与物料",
        sql: "SELECT inv.project_code, p.project_name, p.province_name, inv.material_code, m.material_name,\n  SUM(inv.inventory_amount) AS `库存金额`\nFROM gdcp_dw.cm_inventory_snapshot inv\nINNER JOIN gdcp_dw.cm_project_site p ON inv.project_code = p.project_code\nINNER JOIN gdcp_dw.cm_material_master m ON inv.material_code = m.material_code\nWHERE inv.inventory_date = (\n  SELECT MAX(inventory_date) FROM gdcp_dw.cm_inventory_snapshot\n)\nGROUP BY inv.project_code, p.project_name, p.province_name, inv.material_code, m.material_name\nHAVING SUM(inv.inventory_amount) > (\n  SELECT AVG(prov_avg.`平均金额`)\n  FROM (\n    SELECT i2.project_code, AVG(i2.inventory_amount) AS `平均金额`\n    FROM gdcp_dw.cm_inventory_snapshot i2\n    INNER JOIN gdcp_dw.cm_project_site p2 ON i2.project_code = p2.project_code\n    WHERE p2.province_name = p.province_name\n      AND i2.project_code <> inv.project_code\n      AND i2.inventory_date = inv.inventory_date\n    GROUP BY i2.project_code\n  ) prov_avg\n)\nORDER BY inventory_amount DESC",
        domain: "建筑行业物料台账",
        recommend: true,
      },
      {
        question: "哪些物料在本年仅有出库记录、却没有对应入库记录（异常耗用）？",
        sql: "SELECT DISTINCT o.material_code, m.material_name, m.material_category\nFROM gdcp_dw.cm_outbound_ledger o\nINNER JOIN gdcp_dw.cm_material_master m ON o.material_code = m.material_code\nWHERE YEAR(o.outbound_date) = YEAR(CURRENT_DATE)\n  AND NOT EXISTS (\n    SELECT 1\n    FROM gdcp_dw.cm_inbound_ledger i\n    WHERE i.material_code = o.material_code\n      AND YEAR(i.inbound_date) = YEAR(CURRENT_DATE)\n  )\nORDER BY m.material_category, o.material_code",
        domain: "建筑行业物料台账",
        recommend: false,
      },
      {
        question: "按承建单位汇总：仅统计存在入库且关联物料主数据标准单价高于500元的项目入库金额",
        sql: "SELECT p.contractor_name, SUM(i.inbound_amount) AS `入库金额`\nFROM gdcp_dw.cm_inbound_ledger i\nINNER JOIN gdcp_dw.cm_project_site p ON i.project_code = p.project_code\nWHERE YEAR(i.inbound_date) = YEAR(CURRENT_DATE)\n  AND EXISTS (\n    SELECT 1\n    FROM gdcp_dw.cm_material_master m\n    WHERE m.material_code = i.material_code\n      AND m.standard_unit_price > 500\n  )\nGROUP BY p.contractor_name\nORDER BY `入库金额` DESC",
        domain: "建筑行业物料台账",
        recommend: true,
      },
    ];

    const SETTINGS_PROMPT_POOL = [
      {
        instruction: "统计销售额或订单金额时，默认按交易月份汇总，并优先使用「全国2025年咖啡销售数据」数据集。",
        domain: "销售分析",
        enabled: true,
      },
      {
        instruction: "查询合同相关指标时，合同额统一使用合同台账数据集中的「合同额」字段，并按签订日期过滤年份。",
        domain: "合同管理",
        enabled: true,
      },
      {
        instruction: "当用户问题包含「趋势」「变化」时，优先返回按时间维度排序的折线图数据，并补充同比或环比说明。",
        domain: "通用规则",
        enabled: true,
      },
      {
        instruction: "产品种类、区域名称、交易月份均视为维度字段；销售量、订单金额、合同额视为度量或指标字段。",
        domain: "数据解释",
        enabled: true,
      },
      {
        instruction: "若用户未指定时间范围，默认查询最近 12 个月的数据，并在回答中说明采用的默认时间范围。",
        domain: "通用规则",
        enabled: false,
      },
      {
        instruction: "生成 SQL 须可落地执行：表名带 gdcp_dw. 前缀；主表+至少1张关联表（简短别名 o/c/i/u）；WHERE 含 create_time BETWEEN、is_valid=1、delete_flag=0、order_status IN (1,2,4)、channel_type!=99；使用 DATE_FORMAT、IFNULL/COALESCE、COUNT(DISTINCT)；关键字大写、字段分行、加 -- 注释；AS 别名中文；禁止1-2行简单 SQL；SQL 面板仅展示 SQL 正文。",
        domain: "SQL 生成",
        enabled: true,
      },
      {
        instruction: "排名类问题默认返回 Top 10，若用户明确指定数量则按用户要求限制结果行数。",
        domain: "查询模式",
        enabled: true,
      },
    ];

    function seedSettingsData() {
      settingsData.terms = pickRandomItems(SETTINGS_TERM_POOL, pickRandomCount(3, 5)).map((item) => ({
        id: createSettingsId(),
        ...item,
        creator: "管理员",
        createdAt: formatSettingsDate(randomSettingsPastDate()),
      }));

      settingsData.sql = pickRandomItems(SETTINGS_SQL_POOL, pickRandomCount(3, 5)).map((item) => ({
        id: createSettingsId(),
        ...item,
        creator: "管理员",
        createdAt: formatSettingsDate(randomSettingsPastDate()),
      }));

      settingsData.prompt = pickRandomItems(SETTINGS_PROMPT_POOL, pickRandomCount(3, 5)).map((item) => ({
        id: createSettingsId(),
        ...item,
        createdAt: formatSettingsDate(randomSettingsPastDate()),
      }));
    }

    function renderSettingsEmptyRow(colspan) {
      return `
        <tr class="settings-empty-row">
          <td colspan="${colspan}">
            <div class="settings-empty">
              <div class="settings-empty-art" aria-hidden="true">
                <div class="settings-empty-folder"></div>
                <span class="settings-empty-dot a"></span>
                <span class="settings-empty-dot b"></span>
                <span class="settings-empty-dot c"></span>
              </div>
              <span>暂无数据</span>
            </div>
          </td>
        </tr>
      `;
    }

    function renderSettingsActions(id) {
      return `
        <div class="settings-actions">
          <button class="settings-action-link" type="button" data-settings-action="edit" data-id="${id}">编辑</button>
          <span class="settings-action-divider">|</span>
          <button class="settings-action-link danger" type="button" data-settings-action="delete" data-id="${id}">删除</button>
        </div>
      `;
    }

    function renderSettingsSwitch(checked, id, field) {
      return `
        <label class="settings-switch">
          <input type="checkbox" data-toggle-field="${field}" data-id="${id}" ${checked ? "checked" : ""} />
          <span class="settings-switch-slider"></span>
        </label>
      `;
    }

    function getFilteredSettingsItems(type) {
      const config = SETTINGS_PANEL_CONFIG[type];
      const keyword = (config.searchInput().value || "").trim().toLowerCase();
      const items = settingsData[config.storeKey];
      if (!keyword) return items;
      return items.filter((item) => config.searchFields.some((field) => String(item[field] ?? "").toLowerCase().includes(keyword)));
    }

    function syncSettingsSelection(type) {
      const config = SETTINGS_PANEL_CONFIG[type];
      const visibleIds = new Set(getFilteredSettingsItems(type).map((item) => item.id));
      const selection = settingsSelection[type];
      [...selection].forEach((id) => {
        if (!visibleIds.has(id)) selection.delete(id);
      });
      const selectAllEl = config.selectAll();
      const batchDeleteBtn = config.batchDeleteBtn();
      const hasRows = visibleIds.size > 0;
      selectAllEl.disabled = !hasRows;
      if (!hasRows) {
        selectAllEl.checked = false;
        selectAllEl.indeterminate = false;
        batchDeleteBtn.disabled = true;
        return;
      }
      const selectedVisibleCount = [...selection].filter((id) => visibleIds.has(id)).length;
      selectAllEl.checked = selectedVisibleCount > 0 && selectedVisibleCount === visibleIds.size;
      selectAllEl.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visibleIds.size;
      batchDeleteBtn.disabled = selectedVisibleCount === 0;
    }

    function renderTermsTable() {
      const items = getFilteredSettingsItems("terms");
      const selection = settingsSelection.terms;
      if (!items.length) {
        termTableBodyEl.innerHTML = renderSettingsEmptyRow(SETTINGS_PANEL_CONFIG.terms.colspan);
      } else {
        termTableBodyEl.innerHTML = items.map((item, index) => `
          <tr data-id="${item.id}">
            <td class="col-check"><input type="checkbox" class="settings-row-check" data-id="${item.id}" ${selection.has(item.id) ? "checked" : ""} aria-label="选择行" /></td>
            <td class="col-index">${index + 1}</td>
            <td class="col-text" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</td>
            <td class="col-text" title="${escapeHtml(item.synonyms)}">${escapeHtml(item.synonyms || "—")}</td>
            <td class="col-text-wide" title="${escapeHtml(item.description)}">${escapeHtml(item.description || "—")}</td>
            <td>${escapeHtml(item.creator)}</td>
            <td>${escapeHtml(item.createdAt)}</td>
            <td class="col-actions">${renderSettingsActions(item.id)}</td>
          </tr>
        `).join("");
      }
      syncSettingsSelection("terms");
    }

    function renderSqlTable() {
      const items = getFilteredSettingsItems("sql");
      const selection = settingsSelection.sql;
      if (!items.length) {
        sqlTableBodyEl.innerHTML = renderSettingsEmptyRow(SETTINGS_PANEL_CONFIG.sql.colspan);
      } else {
        sqlTableBodyEl.innerHTML = items.map((item, index) => `
          <tr data-id="${item.id}">
            <td class="col-check"><input type="checkbox" class="settings-row-check" data-id="${item.id}" ${selection.has(item.id) ? "checked" : ""} aria-label="选择行" /></td>
            <td class="col-index">${index + 1}</td>
            <td class="col-text-wide" title="${escapeHtml(item.question)}">${escapeHtml(item.question)}</td>
            <td class="col-text-wide col-sql-preview" title="${escapeHtml(item.sql)}">${QueryEngine.highlightSql(item.sql || "")}</td>
            <td>${escapeHtml(item.domain || "—")}</td>
            <td class="col-recommend">${renderSettingsSwitch(Boolean(item.recommend), item.id, "recommend")}</td>
            <td>${escapeHtml(item.creator)}</td>
            <td class="col-actions">${renderSettingsActions(item.id)}</td>
          </tr>
        `).join("");
      }
      syncSettingsSelection("sql");
    }

    function renderPromptTable() {
      const items = getFilteredSettingsItems("prompt");
      const selection = settingsSelection.prompt;
      if (!items.length) {
        promptTableBodyEl.innerHTML = renderSettingsEmptyRow(SETTINGS_PANEL_CONFIG.prompt.colspan);
      } else {
        promptTableBodyEl.innerHTML = items.map((item, index) => `
          <tr data-id="${item.id}">
            <td class="col-check"><input type="checkbox" class="settings-row-check" data-id="${item.id}" ${selection.has(item.id) ? "checked" : ""} aria-label="选择行" /></td>
            <td class="col-index">${index + 1}</td>
            <td class="col-text-wide" title="${escapeHtml(item.instruction)}">${escapeHtml(item.instruction)}</td>
            <td>${escapeHtml(item.domain || "—")}</td>
            <td class="col-enabled">${renderSettingsSwitch(Boolean(item.enabled), item.id, "enabled")}</td>
            <td>${escapeHtml(item.createdAt)}</td>
            <td class="col-actions">${renderSettingsActions(item.id)}</td>
          </tr>
        `).join("");
      }
      syncSettingsSelection("prompt");
    }

    function renderSettingsTables() {
      renderTermsTable();
      renderSqlTable();
      renderPromptTable();
    }

    function addSqlExampleFromConversation(payload = {}) {
      const question = String(payload.question || "").trim();
      const sql = String(payload.sql || "").trim();
      const domain = String(payload.domain || QueryEngine.BUSINESS_MODEL.name).trim();

      if (!question) {
        return { ok: false, error: "缺少问题描述，无法添加到 SQL 示例库" };
      }
      if (!sql) {
        return { ok: false, error: "缺少 SQL 内容，无法添加到 SQL 示例库" };
      }

      const existing = settingsData.sql.find((item) => item.question === question);
      if (existing) {
        existing.sql = sql;
        existing.domain = domain;
        existing.recommend = true;
        renderSqlTable();
        renderRecommendStrip();
        return {
          ok: true,
          updated: true,
          message: "已更新 SQL 示例库中的同名问句，并设为推荐问句",
        };
      }

      settingsData.sql.unshift({
        id: createSettingsId(),
        question,
        sql,
        domain,
        recommend: true,
        creator: "管理员",
        createdAt: formatSettingsDate(),
      });
      renderSqlTable();
      renderRecommendStrip();
      return {
        ok: true,
        message: "已添加到 SQL 示例库，业务域为当前业务模型，并设为推荐问句",
      };
    }

    function getSettingsItem(type, id) {
      return settingsData[SETTINGS_PANEL_CONFIG[type].storeKey].find((item) => item.id === id);
    }

    function deleteSettingsItems(type, ids) {
      const storeKey = SETTINGS_PANEL_CONFIG[type].storeKey;
      const idSet = new Set(ids);
      settingsData[storeKey] = settingsData[storeKey].filter((item) => !idSet.has(item.id));
      ids.forEach((id) => settingsSelection[type].delete(id));
      renderSettingsTables();
      if (type === "sql") renderRecommendStrip();
    }

    function confirmDeleteSettingsItems(type, count) {
      const label = SETTINGS_PANEL_CONFIG[type].label;
      return window.confirm(`确定删除选中的 ${count} 条${label}吗？`);
    }

    function handleSettingsBatchDelete(type) {
      const ids = [...settingsSelection[type]];
      if (!ids.length) return;
      if (!confirmDeleteSettingsItems(type, ids.length)) return;
      deleteSettingsItems(type, ids);
    }

    function handleSettingsRowDelete(type, id) {
      const label = SETTINGS_PANEL_CONFIG[type].label;
      if (!window.confirm(`确定删除该条${label}吗？`)) return;
      deleteSettingsItems(type, [id]);
    }

    function buildSettingsFormFields(type, item = null) {
      if (type === "terms") {
        return `
          <div class="settings-form-field">
            <label for="settingsFormName">术语名称<span class="required">*</span></label>
            <input id="settingsFormName" type="text" value="${escapeHtml(item?.name || "")}" placeholder="请输入术语名称" />
          </div>
          <div class="settings-form-field">
            <label for="settingsFormSynonyms">同义词/标签</label>
            <input id="settingsFormSynonyms" type="text" value="${escapeHtml(item?.synonyms || "")}" placeholder="多个同义词可用逗号分隔" />
          </div>
          <div class="settings-form-field">
            <label for="settingsFormDescription">术语描述</label>
            <textarea id="settingsFormDescription" placeholder="请输入术语描述">${escapeHtml(item?.description || "")}</textarea>
          </div>
        `;
      }
      if (type === "sql") {
        return `
          <div class="settings-form-field">
            <label for="settingsFormQuestion">问题描述<span class="required">*</span></label>
            <input id="settingsFormQuestion" type="text" value="${escapeHtml(item?.question || "")}" placeholder="请输入问题描述" />
          </div>
          <div class="settings-form-field">
            <label for="settingsFormSql">示例 SQL<span class="required">*</span></label>
            <textarea id="settingsFormSql" placeholder="请输入示例 SQL">${escapeHtml(item?.sql || "")}</textarea>
          </div>
          <div class="settings-form-field">
            <label for="settingsFormDomain">业务域</label>
            <input id="settingsFormDomain" type="text" value="${escapeHtml(item?.domain || "")}" placeholder="请输入业务域" />
          </div>
          <div class="settings-form-field settings-form-field-row">
            <label for="settingsFormRecommend">设置为推荐问题</label>
            <label class="settings-switch">
              <input id="settingsFormRecommend" type="checkbox" ${item?.recommend ? "checked" : ""} />
              <span class="settings-switch-slider"></span>
            </label>
          </div>
        `;
      }
      return `
        <div class="settings-form-field">
          <label for="settingsFormInstruction">指令<span class="required">*</span></label>
          <textarea id="settingsFormInstruction" placeholder="请输入指令内容">${escapeHtml(item?.instruction || "")}</textarea>
        </div>
        <div class="settings-form-field">
          <label for="settingsFormDomain">业务域</label>
          <input id="settingsFormDomain" type="text" value="${escapeHtml(item?.domain || "")}" placeholder="请输入业务域" />
        </div>
        <div class="settings-form-field settings-form-field-row">
          <label for="settingsFormEnabled">启用</label>
          <label class="settings-switch">
            <input id="settingsFormEnabled" type="checkbox" ${(item ? item.enabled : true) ? "checked" : ""} />
            <span class="settings-switch-slider"></span>
          </label>
        </div>
      `;
    }

    function openSettingsForm(type, item = null) {
      settingsFormType = type;
      settingsFormEditingId = item?.id || null;
      const isEdit = Boolean(item);
      settingsFormTitleEl.textContent = isEdit ? `编辑${SETTINGS_PANEL_CONFIG[type].label}` : `创建${SETTINGS_PANEL_CONFIG[type].label}`;
      settingsFormBodyEl.innerHTML = buildSettingsFormFields(type, item);
      settingsFormOverlayEl.hidden = false;
      const firstInput = settingsFormBodyEl.querySelector("input, textarea");
      if (firstInput) firstInput.focus();
    }

    function closeSettingsForm() {
      settingsFormOverlayEl.hidden = true;
      settingsFormType = null;
      settingsFormEditingId = null;
      settingsFormBodyEl.innerHTML = "";
    }

    function readSettingsFormValues(type) {
      if (type === "terms") {
        return {
          name: document.getElementById("settingsFormName").value.trim(),
          synonyms: document.getElementById("settingsFormSynonyms").value.trim(),
          description: document.getElementById("settingsFormDescription").value.trim(),
        };
      }
      if (type === "sql") {
        return {
          question: document.getElementById("settingsFormQuestion").value.trim(),
          sql: document.getElementById("settingsFormSql").value.trim(),
          domain: document.getElementById("settingsFormDomain").value.trim(),
          recommend: document.getElementById("settingsFormRecommend").checked,
        };
      }
      return {
        instruction: document.getElementById("settingsFormInstruction").value.trim(),
        domain: document.getElementById("settingsFormDomain").value.trim(),
        enabled: document.getElementById("settingsFormEnabled").checked,
      };
    }

    function validateSettingsForm(type, values) {
      if (type === "terms" && !values.name) {
        window.alert("请填写术语名称");
        return false;
      }
      if (type === "sql") {
        if (!values.question) {
          window.alert("请填写问题描述");
          return false;
        }
        if (!values.sql) {
          window.alert("请填写示例 SQL");
          return false;
        }
      }
      if (type === "prompt" && !values.instruction) {
        window.alert("请填写指令内容");
        return false;
      }
      return true;
    }

    function saveSettingsForm() {
      if (!settingsFormType) return;
      const type = settingsFormType;
      const values = readSettingsFormValues(type);
      if (!validateSettingsForm(type, values)) return;
      const storeKey = SETTINGS_PANEL_CONFIG[type].storeKey;
      if (settingsFormEditingId) {
        const target = getSettingsItem(type, settingsFormEditingId);
        if (target) Object.assign(target, values);
      } else {
        const base = { id: createSettingsId(), ...values };
        if (type === "terms" || type === "sql") {
          base.creator = "管理员";
          base.createdAt = formatSettingsDate();
        } else {
          base.createdAt = formatSettingsDate();
        }
        settingsData[storeKey].unshift(base);
      }
      closeSettingsForm();
      renderSettingsTables();
      if (type === "sql") renderRecommendStrip();
    }

    function handleSettingsTableChange(event, type) {
      const rowCheck = event.target.closest(".settings-row-check");
      if (rowCheck) {
        const { id } = rowCheck.dataset;
        if (rowCheck.checked) settingsSelection[type].add(id);
        else settingsSelection[type].delete(id);
        syncSettingsSelection(type);
        return;
      }

      const toggleInput = event.target.closest("[data-toggle-field]");
      if (!toggleInput) return;
      const item = getSettingsItem(type, toggleInput.dataset.id);
      if (!item) return;
      item[toggleInput.dataset.toggleField] = toggleInput.checked;
      if (type === "sql" && toggleInput.dataset.toggleField === "recommend") {
        renderRecommendStrip();
      }
    }

    function handleSettingsTableClick(event, type) {
      const actionBtn = event.target.closest("[data-settings-action]");
      if (!actionBtn) return;
      event.stopPropagation();
      const action = actionBtn.dataset.settingsAction;
      const { id } = actionBtn.dataset;
      if (action === "edit") {
        const item = getSettingsItem(type, id);
        if (item) openSettingsForm(type, item);
      } else if (action === "delete") {
        handleSettingsRowDelete(type, id);
      }
    }

    function handleSettingsSelectAll(type, checked) {
      const selection = settingsSelection[type];
      getFilteredSettingsItems(type).forEach((item) => {
        if (checked) selection.add(item.id);
        else selection.delete(item.id);
      });
      renderSettingsTables();
    }

    function bindSettingsTableEvents(tableBodyEl, type) {
      tableBodyEl.addEventListener("click", (event) => handleSettingsTableClick(event, type));
      tableBodyEl.addEventListener("change", (event) => handleSettingsTableChange(event, type));
    }

    bindSettingsTableEvents(termTableBodyEl, "terms");
    bindSettingsTableEvents(sqlTableBodyEl, "sql");
    bindSettingsTableEvents(promptTableBodyEl, "prompt");

    termCreateBtnEl.addEventListener("click", () => openSettingsForm("terms"));
    sqlCreateBtnEl.addEventListener("click", () => openSettingsForm("sql"));
    promptCreateBtnEl.addEventListener("click", () => openSettingsForm("prompt"));

    termBatchDeleteBtnEl.addEventListener("click", () => handleSettingsBatchDelete("terms"));
    sqlBatchDeleteBtnEl.addEventListener("click", () => handleSettingsBatchDelete("sql"));
    promptBatchDeleteBtnEl.addEventListener("click", () => handleSettingsBatchDelete("prompt"));

    termSelectAllEl.addEventListener("change", (event) => handleSettingsSelectAll("terms", event.target.checked));
    sqlSelectAllEl.addEventListener("change", (event) => handleSettingsSelectAll("sql", event.target.checked));
    promptSelectAllEl.addEventListener("change", (event) => handleSettingsSelectAll("prompt", event.target.checked));

    termSearchInputEl.addEventListener("input", renderTermsTable);
    sqlSearchInputEl.addEventListener("input", renderSqlTable);
    promptSearchInputEl.addEventListener("input", renderPromptTable);

    closeSettingsFormBtnEl.addEventListener("click", closeSettingsForm);
    settingsFormCancelBtnEl.addEventListener("click", closeSettingsForm);
    settingsFormSaveBtnEl.addEventListener("click", saveSettingsForm);
    settingsFormOverlayEl.addEventListener("click", (event) => {
      if (event.target === settingsFormOverlayEl) closeSettingsForm();
    });

    seedSettingsData();
    renderSettingsTables();
    renderRecommendStrip();
    bindAssistantSettingsEvents();

    closeSettingsModalEl.addEventListener("click", closeSettingsModal);
    settingsCancelBtnEl.addEventListener("click", closeSettingsModal);
    settingsConfirmBtnEl.addEventListener("click", closeSettingsModal);
    settingsModalOverlayEl.addEventListener("click", (event) => {
      if (event.target === settingsModalOverlayEl) closeSettingsModal();
    });
    settingsNavItems.forEach((item) => {
      item.addEventListener("click", () => switchSettingsPanel(item.dataset.settingsPanel));
    });

    api.open = openSettingsModal;
    api.close = closeSettingsModal;
    api.addSqlExampleFromConversation = addSqlExampleFromConversation;
    return api;
  }

  const api = { init };
  global.SettingsModal = api;
})(window);