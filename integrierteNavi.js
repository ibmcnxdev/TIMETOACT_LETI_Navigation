(() => {
	'use strict';

	const customizationDir = "/xcc/rest/public/custom/";

	let request = new XMLHttpRequest();

	request.open('GET', customizationDir + "intNaviConfig.json");
	request.onload = function () {
		try {
			let config = JSON.parse(this.response);
			callback(config);
		} catch (err) {
			callback(
				{
					parentID: "nav_bar_include",
					wikiID: "W43496eaaca84_415f_9430_161a8fa71f65",
					wikiURL: '/wikis/basic/api/wiki/',
					customIcons: [
						{
							name: "activityStream",
							filename: "stream_white.svg",
							href: "/homepage/web/updates/#myStream/imFollowing/all",
							order: 360001	//350000 < order < 400000
						},
						{
							name: "communities",
							filename: "communities_white.svg",
							href: "/communities/service/html/mycommunities",
							order: 360002
						},
						{
							name: "files",
							filename: "files_white.svg",
							href: "/files/app#/",
							order: 360003
						},
						{
							name: "apps",
							filename: "applications_white.svg",
							children: [{
								name: "",
								label: "Aktivitäten",
								href: "/activities/service/html/mainpage"
							}, {
								name: "",
								label: "Besprechungen",
								href: "/meetings/sthome"
							}, {
								name: "",
								label: "Besprechungen organisieren",
								href: "/stmeetings/room/join/access?id=E9531-1290"
							}],
							order: 360004
						},
						{
							name: "help",
							filename: "bulb_white.svg",
							href: "/communities/service/html/communitystart?communityUuid=bbe69c20-16a4-42fd-b7a1-bccf29f37522",
							order: 550001	// > 500000
						}
					]
				}
			);
		}
	};

	request.send();

	function callback(config) {
		const {parentID, wikiID, wikiURL, customIcons} = config;
		const stylesheet = customizationDir + "integratedNavi.css";
		const replacedIcons = [
			{
				parent: ".help-image",
				content: `<style type="text/css">
	.st0{fill:#FFFFFF;}
</style>
<path class="st0" d="M495.9,336.7c-2.1-7.6-6.9-13.9-13.7-17.8l-50.7-29.2c2-10.8,3.1-21.9,3.1-33.2c0-11.2-1-22.3-3.1-33.2
	l50.7-29.2c14.1-8.1,18.9-26.2,10.8-40.3l-29.6-51.1c-5.2-9.1-15-14.7-25.5-14.7c-5.1,0-10.2,1.4-14.7,3.9l-50.7,29.2
	C355.7,106.7,336,95.3,315,87.9V29.5C315,13.2,301.8,0,285.5,0h-59.1C210.2,0,197,13.2,197,29.5v58.5c-20.9,7.3-40.6,18.7-57.5,33.2
	L88.8,91.9c-4.4-2.6-9.5-3.9-14.7-3.9c-10.5,0-20.3,5.6-25.6,14.7L19,153.8c-8.1,14-3.3,32.1,10.8,40.3l50.7,29.2
	c-2.1,10.9-3.1,22.1-3.1,33.2c0,11.1,1,22.3,3.1,33.2l-50.7,29.3c-14,8.1-18.9,26.2-10.8,40.2l29.6,51.2c5.2,9,15,14.6,25.6,14.6
	c5.1,0,10.2-1.4,14.7-3.9l50.7-29.3c16.9,14.5,36.6,25.9,57.5,33.2v58.5c0,16.2,13.2,29.5,29.5,29.5h59.1
	c16.2,0,29.5-13.2,29.5-29.5V425c20.9-7.3,40.6-18.7,57.5-33.2l50.8,29.3c4.5,2.6,9.5,3.9,14.6,3.9c10.5,0,20.3-5.6,25.5-14.7
	l29.5-51.2C496.9,352.3,497.9,344.3,495.9,336.7z M256,344.7c-48.7,0-88.3-39.6-88.3-88.2c0-48.6,39.6-88.2,88.3-88.2
	c48.7,0,88.2,39.6,88.2,88.2C344.3,305.1,304.7,344.7,256,344.7z"/>`,
				viewBox: "0 0 512 512"
			}
		];

		let target,
			parent = document.getElementById(parentID),
			observer,
			sheet;

		function getWikiFeed(url, isJSON, callback) {
			let request = new XMLHttpRequest();

			request.open('GET', url);
			request.onload = function () {
				try {
					isJSON ? callback(JSON.parse(this.response)) : callback(this.responseXML);
				} catch (err) {
					callback({});
				}
			};
			request.send();
		}

		//Get
		function retrieveUrl(wikiPageId) {

			function getCurrentServletUrl(currentServlet) {
				// If we are in Communities, we will use /xcc/main
				// if we are in on premise, we will cut the url for # (if you got CNX Widgets/RC/AS)
				// because the url can something like that: https://dev.cnx.local/xcc/main#myStream/imFollowing/all
				// if we are in cloud/global we will cut for ?

				if (!currentServlet) {
					currentServlet = window.location.href.indexOf("/xcc/") > -1 ? (window.location.href + "?").split("?")[0].split("#")[0] : "/xcc/main";
				}
				return currentServlet;
			}

			getWikiFeed(wikiURL + wikiID + '/page/' + wikiPageId + '/entry', false, xml => {
				let content = xml.getElementsByTagName('summary')[0].textContent;

				if (content.indexOf('xcc://') >= 0) {
					content = content.replace(
							'xcc://',
							getCurrentServletUrl()
					);
				}
				if (content.length > 0) {
					//event.target.href = content;
					window.location.href = content;
				}
			},
				false
			);
			return true;
		}

		//Create Navigation from Wikifeed
		function createNav(element, wikiData, level) {

			let htmlParent = document.createElement('li'),
				a = document.createElement('a'),
				htmlChildren,
				i,
				el,
				child,
				filterArr;
			a.innerHTML = element.label;
			a.id = element.id;
			a.name = element.label;
			a.onmousedown = event => retrieveUrl((event.target || event.srcElement).id, event);

			htmlParent.classList.add("customNavigation");
			htmlParent.appendChild(a);

			if (element.childSize > 0) {
				filterArr = function (obj) {
					return obj.id === el;
				};

				htmlParent.classList.add("hasChildren");

				htmlChildren = document.createElement('ul');
				htmlChildren.setAttribute('class', 'navLevel-' + level);

				for (i = 0; i < element.children.length; i += 1) {
					el = element.children[i]._reference;
					child = wikiData.items.filter(filterArr);
					htmlChildren.appendChild(createNav(child[0], wikiData, level + 1));
				}
				htmlParent.appendChild(htmlChildren);
			}
			return htmlParent;
		}

		//Add Custom Header Icons
		function addCustomIcons() {

			let container = document.getElementById(parentID);

			customIcons.forEach(icon => {
				{
					let node = document.createElement("A"),
						nodeIMG = document.createElement("IMG"),
						childMenu;

					node.classList.add("headerIcons");
					nodeIMG.src = customizationDir + icon.filename;
					node.style.order = icon.order;

					if (icon.children) {
						node.classList.add("navmenu");
						childMenu = document.createElement("UL");
						childMenu.classList.add("navsimplelist");

						icon.children.forEach(child => {
							let listElement = document.createElement("LI");
							listElement.innerHTML = `<a href = ${child.href}>${child.label}</a>`;
							childMenu.appendChild(listElement);
						});

						node.appendChild(childMenu);
					} else {
						node.href = icon.href;
					}

					node.appendChild(nodeIMG);
					container.appendChild(node);
				}
			});
		}

		//Replace Existing Header Icons
		function replaceIcons() {
			let target = document.querySelector('.ics-scbanner'),
				observer = new MutationObserver(() => {
					replacedIcons.reduce((accumulator, currentValue, index) => {
						let parent = document.querySelector(currentValue.parent);
						if (parent) {
							changeSVG(parent, currentValue);
							return accumulator.splice(index, 1);
						}
						return accumulator;
					}, replacedIcons);

					if (!replacedIcons.length) {
						observer.disconnect();
					}
				});

			function changeSVG(parent, element) {
				parent.setAttribute("viewBox", element.viewBox);
				parent.innerHTML = element.content;
			}

			observer.observe(target,
				{
					attributes: false,
					childList: true,
					characterData: false,
					subtree: false
				}
			);
		}

		function initNavi(container) {

			container.classList.add("integrated-navi");

			getWikiFeed(wikiURL + wikiID + "/nav/feed", true, wikiData => {
				let tree = wikiData.items.filter(obj => obj.id === 'tree'), //JSON mit allen (Unter)seiten
					target = document.createElement("UL"),
					nav = createNav(tree[0], wikiData, 0),
					nodeList = nav.querySelector('ul').childNodes;

				target.classList.add("navLevel-0");

				while (nodeList.length) {
					target.insertBefore(nodeList[nodeList.length - 1], target.firstChild);
				}
				container.appendChild(target);
			});

			addCustomIcons();
			replaceIcons();
		}


		//START
		sheet = document.createElement('link');
		sheet.rel = 'stylesheet';
		sheet.type = 'text/css';
		sheet.href = stylesheet;
		sheet.media = 'all';
		document.getElementsByTagName('head')[0].appendChild(sheet);

		if (parent) {
			initNavi(parent);
		} else {
			target = document.querySelector('body');
			observer = new MutationObserver(() => {
				parent = document.getElementById(parentID);
				if (parent) {
					initNavi(parent);
					observer.disconnect();
				}
			});

			observer.observe(target,
				{
					attributes: false,
					childList: true,
					characterData: false,
					subtree: false
				}
			);
		}

	}

})();
