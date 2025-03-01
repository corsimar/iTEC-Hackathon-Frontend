import {
  getUserApplicationsInfo,
  getIfIsUserApp,
} from "../../services/user.js";
import {
  insertApplication,
  getApplications,
  getApplicationById,
  patchApplication,
  deleteApplication,
} from "../../services/applications.js";
import {
  insertEndpoint,
  getEndpoints,
  deleteEndpointRequest,
  getEndpointHistoryByHours,
  getEndpointHistoryById,
} from "../../services/endpoints.js";
import {
  getGeneralStatistics,
  getEndpointsStatistics,
  getReportsStatistics,
} from "../../services/statistics.js";
import {
  insertReport,
  getNotifications,
  patchReport,
} from "../../services/report.js";
import { register, login } from "../../services/auth.js";
import "../../interfaces/endpoint.js";
import "../../interfaces/generalStatistics.js";
import { Endpoint } from "../../interfaces/endpoint.js";
import { GeneralStatistics } from "../../interfaces/generalStatistics.js";

var authArea,
  logout,
  myApplicationsDashboard,
  notifications,
  history,
  information,
  logout2,
  myApplicationsDashboard2,
  notifications2,
  history2,
  information2;
var sidebar, closeBtn;
var homeSection,
  commentsSection,
  historySection,
  settingsSection,
  myApplications,
  addPopup,
  endpointSection;
var cards, myApplicationsCards;

var applicationTitle,
  applicationDescription,
  applicationImage,
  addApplicationBtn;

var currentApplicationId, currentEndpointId, currentReportId;
var endpointsWrapper;
var endpointUrl, endpointType;
var getEndpoint, postEndpoint, putEndpoint, patchEndpoint, deleteEndpoint;
var endpointStatisticsHours, endpointStatisticsUnit;

var totalProjects,
  totalEndpoints,
  endpointsStable,
  endpointsUnstable,
  endpointsDown;

var personalStatsEmail,
  totalProjectsLabel,
  totalEndpointsLabel,
  endpointsStableLabel,
  endpointsUnstableLabel,
  endpointsDownLabel;

var notification, notificationWrapper, notificationBadge;

function updatePersonalStatistics() {
  totalProjectsLabel.text(totalProjects);
  totalEndpointsLabel.text(totalEndpoints);
  endpointsStableLabel.text(endpointsStable);
  endpointsUnstableLabel.text(endpointsUnstable);
  endpointsDownLabel.text(endpointsDown);
}

// Endpoints charts
var endpointChart;
var endpointChartX = ["Successful calls", "Unsuccessful calls"];
var endpointChartY = [0, 0];
var endpointChartBarColors = ["#00aba9", "#b91d47"];

// General statistics
var generalStatistics = new GeneralStatistics(0, 0, 0, 0);
var totalApplicationsLabel,
  totalEndpointsGeneralLabel,
  totalUsersLabel,
  totalEndpointCallsLabel;

var generalEndpoints, configGeneralEndpoints, generalEndpointsChart;
var generalReports, configGeneralReports, generalReportsChart;

var reportMentions;

function loadNotifications() {
  var userId = parseInt($.cookie("UserId"));

  if (userId === undefined) return;

  getNotifications(userId).done(function (data) {
    if (data.length > 0) {
      var element = $("#notificationWrapper").children().eq(0).clone();
      $("#notificationWrapper").empty();
      $("#notificationWrapper").append(element);
      notificationBadge.attr("hidden", false);
      if (data.length < 10) notificationBadge.text(data.length);
      else notificationBadge.text("");

      for (let i = 0; i < data.length; i++) {
        var element = notification.clone();

        element.attr("id", "notification" + data[i].idApplicationReport);
        element.children().eq(0).children().eq(0).text(data[i].email);
        element.children().eq(1).children().eq(0).text(data[i].mentions);
        element
          .children()
          .eq(1)
          .children()
          .eq(1)
          .children()
          .eq(0)
          .children()
          .eq(0)
          .text(data[i].name);
        element
          .children()
          .eq(1)
          .children()
          .eq(1)
          .children()
          .eq(1)
          .children()
          .eq(0)
          .text(data[i].url);
        element
          .children()
          .eq(1)
          .children()
          .eq(1)
          .children()
          .eq(2)
          .children()
          .eq(0)
          .text(data[i].type);

        element
          .children()
          .eq(1)
          .children()
          .eq(2)
          .text(
            data[i].dateCreated
              .replace("T", " ")
              .substring(0, data[i].dateCreated.indexOf("."))
          );

        element
          .children()
          .eq(0)
          .children()
          .eq(1)
          .children()
          .eq(0)
          .click(function () {
            currentReportId = data[i].idApplicationReport;

            patchReport({
              idApplicationReport: currentReportId,
              markedAsSolved: 1,
            }).done(function () {
              $("#notification" + currentReportId).remove();

              var notificationsCount =
                notificationWrapper.children().length - 1;
              if (notificationsCount > 0 && notificationsCount < 10) {
                notificationBadge.text(notificationsCount);
              } else if (notificationsCount == 0) {
                notificationBadge.remove();
              } else {
                notificationBadge.text("9+");
              }
            });
          });

        element.attr("hidden", false);

        notificationWrapper.append(element);
      }

      var notificationsCount = notificationWrapper.children().length - 1;
      console.log(notificationsCount);
      if (notificationsCount > 0 && notificationsCount < 10) {
        notificationBadge.text(notificationsCount);
        notificationBadge.attr("hidden", false);
      } else if (notificationsCount == 0) {
        notificationBadge.attr("hidden", true);
      } else {
        notificationBadge.text("9+");
        notificationBadge.attr("hidden", false);
      }
    }
  });
}

function checkLoginStatus() {
  var userId = $.cookie("UserId");

  if (userId !== undefined) {
    authArea.attr("hidden", true);
    getUserApplicationsInfo(parseInt(userId)).done(function (data) {
      personalStatsEmail.text(data[0].email);
      totalProjects = data[0].nrOfApplications;
      totalEndpoints = data[0].nrOfEndpoints;
      endpointsStable = data[0].nrOfEndpointsStable;
      endpointsUnstable = data[0].nrOfEndpointsUnstable;
      endpointsDown = data[0].nrOfEndpointsDown;
      updatePersonalStatistics();
    });
  } else {
    logout.attr("hidden", true);
    myApplicationsDashboard.attr("hidden", true);
    notifications.attr("hidden", true);
    history.attr("hidden", true);
    information.attr("hidden", true);
    logout2.attr("hidden", true);
    myApplicationsDashboard2.attr("hidden", true);
    notifications2.attr("hidden", true);
    history2.attr("hidden", true);
    information2.attr("hidden", true);
  }
}

function addCard(idUserAuthor, application) {
  var card;
  if (idUserAuthor == 0) {
    card = $("#card").clone();
    card.attr("id", "card" + application.idApplication);
  } else {
    card = $("#myApplicationsCard").clone();
    card.attr("id", "myApplicationsCard" + application.idApplication);
  }

  if (application.applicationState === "Unstable") {
    card.children().eq(0).css("background-color", "#B2B802");
    card.children().eq(0).children().eq(0).html("Unstable");
  } else if (application.applicationState === "Down") {
    card.children().eq(0).css("background", "red");
    card.children().eq(0).children().eq(0).text("Down");
  }

  card
    .children()
    .eq(1)
    .children()
    .eq(0)
    .attr("src", "../../static/images/main/applications/" + application.image);

  card.children().eq(2).children().eq(0).text(application.name);
  card.children().eq(2).children().eq(1).text(application.description);

  card
    .children()
    .eq(2)
    .children()
    .eq(2)
    .children()
    .eq(0)
    .text(application.userEmail);

  if (application.userEmail == null || application.userEmail === undefined) {
    card
      .children()
      .eq(2)
      .children()
      .eq(2)
      .children()
      .eq(0)
      .text(personalStatsEmail.text());
  }

  card
    .children()
    .eq(2)
    .children()
    .eq(2)
    .children()
    .eq(1)
    .text(
      application.dateCreated
        .replace("T", " ")
        .substring(0, application.dateCreated.indexOf("."))
    );

  card.attr("hidden", false);

  if (idUserAuthor == 0) {
    cards.append(card);

    card
      .children()
      .eq(2)
      .children()
      .eq(3)
      .click(function () {
        homeSection.hide();
        myApplications.hide();
        endpointSection.show();

        $("#filterEndpoints").val("0");

        currentApplicationId = application.idApplication;

        var userId = parseInt($.cookie("UserId"));

        getIfIsUserApp(userId, currentApplicationId).done(function (data) {
          loadEndpoints(application.idApplication, data[0].isAuthor);
        });
      });
  } else {
    card
      .children()
      .eq(2)
      .children()
      .eq(3)
      .children()
      .eq(0)
      .click(function () {
        myApplications.hide();
        endpointSection.show();

        $("#filterEndpoints").val("0");

        currentApplicationId = application.idApplication;
        loadEndpoints(application.idApplication, true);
      });

    card
      .children()
      .eq(2)
      .children()
      .eq(3)
      .children()
      .eq(1)
      .click(function () {
        currentApplicationId = application.idApplication;
        $("#myModal").show();
      });

    myApplicationsCards.append(card);
  }
}

function deleteCard() {
  deleteApplication(currentApplicationId)
    .done(function (data) {
      $("#myModal").hide();
      $("#myApplicationsCard" + currentApplicationId).remove();
      currentApplicationId = 0;
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.log(errorThrown);
    });
}

function onLogout() {
  document.cookie = "UserId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "http://127.0.0.1:5500/templates/auth/login.html";
}

function loadCards(idUserAuthor) {
  getApplications(idUserAuthor)
    .done(function (data) {
      console.log(data);
      for (let i = 0; i < data.length; i++) {
        addCard(idUserAuthor, data[i]);
      }

      if (idUserAuthor == 0) $("#card").attr("hidden", true);
      else $("#myApplicationsCard").attr("hidden", true);
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.log(errorThrown);
      if (idUserAuthor == 0) $("#card").remove();
      else $("#myApplicationsCard").remove();
    });
}

function addEndpointCard(idEndpoint, endpoint, ownApplication) {
  var card;

  if (endpoint.idType == 1) card = getEndpoint.clone();
  else if (endpoint.idType == 2) card = postEndpoint.clone();
  else if (endpoint.idType == 3) card = putEndpoint.clone();
  else if (endpoint.idType == 4) card = patchEndpoint.clone();
  else if (endpoint.idType == 5) card = deleteEndpoint.clone();

  if (ownApplication) card.attr("id", "myApplicationsEndpoint" + idEndpoint);
  else card.attr("id", "endpoint" + idEndpoint);

  if (endpoint.endpointState === "Unstable")
    card
      .children()
      .eq(1)
      .children()
      .eq(0)
      .children()
      .eq(1)
      .css("background", "rgb(152, 152, 0");
  else if (endpoint.endpointState === "Down")
    card
      .children()
      .eq(1)
      .children()
      .eq(0)
      .children()
      .eq(1)
      .css("background", "red");

  card
    .children()
    .eq(1)
    .children()
    .eq(1)
    .children()
    .eq(0)
    .text("URL: " + endpoint.url);

  if (endpoint.dateCreated != null)
    card
      .children()
      .eq(1)
      .children()
      .eq(1)
      .children()
      .eq(2)
      .text("Date created: " + endpoint.dateCreated);
  else {
    var date = new Date();

    card
      .children()
      .eq(1)
      .children()
      .eq(1)
      .children()
      .eq(2)
      .text(
        date.getFullYear() +
          "-" +
          (date.getMonth() + 1) +
          "-" +
          date.getDate() +
          " " +
          date.getHours() +
          ":" +
          date.getMinutes() +
          ":" +
          date.getSeconds()
      );
  }

  card
    .children()
    .eq(1)
    .children()
    .eq(0)
    .children()
    .eq(1)
    .children()
    .eq(0)
    .text(endpoint.endpointState);

  if (ownApplication) {
    card.children().eq(1).children().eq(5).remove();

    card
      .children()
      .eq(1)
      .children()
      .eq(2)
      .click(function () {
        currentEndpointId = idEndpoint;
        $("#viewStatisticsChoice").show();
      });

    card
      .children()
      .eq(1)
      .children()
      .eq(3)
      .click(function () {
        currentEndpointId = idEndpoint;
        getEndpointHistoryById(currentEndpointId).done(function (data) {
          var element = $("#historyEndpoint").clone();
          $("#historyWrapper").empty();
          $("#historyWrapper").append(element);

          for (let i = 0; i < data.length; i++) {
            var element = $("#historyEndpoint").clone();

            element
              .children()
              .eq(0)
              .children()
              .eq(0)
              .text(
                data[i].dateCreated
                  .replace("T", " ")
                  .substring(0, data[i].dateCreated.indexOf("."))
              );

            if (data[i].code != 200 && data[i].code != 302) {
              element
                .children()
                .eq(0)
                .children()
                .eq(1)
                .css("background", "red");
              element
                .children()
                .eq(0)
                .children()
                .eq(1)
                .text("Code: " + data[i].code);
            }

            element.attr("hidden", false);

            $("#historyWrapper").append(element);
          }
        });
      });

    card
      .children()
      .eq(1)
      .children()
      .eq(4)
      .click(function () {
        currentEndpointId = idEndpoint;
      });
  } else {
    card.children().eq(1).children().eq(2).remove();
    card.children().eq(1).children().eq(2).remove();
    card.children().eq(1).children().eq(2).remove();

    card
      .children()
      .eq(1)
      .children()
      .eq(2)
      .click(function () {
        currentEndpointId = idEndpoint;
        $("#reportPopup").show();
      });
  }

  card.attr("hidden", false);

  endpointsWrapper.append(card);
}

function convertTypeStrToInt(typeStr) {
  if (typeStr === "GET") return 1;
  else if (typeStr === "POST") return 2;
  else if (typeStr === "PUT") return 3;
  else if (typeStr === "PATCH") return 4;
  else if (typeStr === "DELETE") return 5;
  else return 0;
}

function loadEndpoints(idApplication, ownApplication) {
  getEndpoints(idApplication).done(function (data) {
    endpointsWrapper.empty();

    for (let i = 0; i < data.length; i++)
      addEndpointCard(
        data[i].idEndpoint,
        new Endpoint(
          data[i].url,
          convertTypeStrToInt(data[i].type),
          idApplication,
          data[i].dateCreated
            .replace("T", " ")
            .substring(0, data[i].dateCreated.indexOf(".")),
          data[i].endpointState
        ),
        ownApplication
      );
  });
}

async function onFilterEndpoints(event) {
  var filter = event.target.value;

  endpointsWrapper.children().each(function (index, card) {
    var text = $(card)
      .children()
      .eq(1)
      .children()
      .eq(0)
      .children()
      .eq(1)
      .children()
      .eq(0)
      .text();

    if (text === "Stable" && (filter == 2 || filter == 3)) {
      $(card).hide();
    } else if (text === "Unstable" && (filter == 1 || filter == 3)) {
      $(card).hide();
    } else if (text === "Down" && (filter == 1 || filter == 2)) {
      $(card).hide();
    } else {
      $(card).show();
    }
  });
}

async function addEndpoint() {
  var url = $("#endpointUrl").val();
  var idType = parseInt($("#endpointType").val());

  if (url < 3) {
    alert("Type a valid url for the endpoint!");
    return;
  }

  var endpoint = new Endpoint(url, idType, currentApplicationId, null);

  insertEndpoint({
    url: endpoint.url,
    idType: endpoint.idType,
    idApplication: endpoint.idApplication,
  })
    .done(function (data) {
      addEndpointCard(data, endpoint, true);

      $("#endpointUrl").val("");

      totalEndpoints++;
      endpointsStable++;
      updatePersonalStatistics();
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.log(errorThrown);
    });
}

async function cancelEndpointStatisticsModal() {
  $("#viewStatisticsChoice").hide();
  endpointStatisticsHours.val("");
  endpointStatisticsUnit.val("1");
  $("#viewStatistics").hide();
}

function countEndpointCalls(data) {
  var successful = 0,
    unsuccessful = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i].code == 200 || data[i].code == 302) successful++;
    else unsuccessful++;
  }

  return [successful, unsuccessful];
}

async function showEndpointStatistics() {
  if ($("#endpointStatisticsHours").val() === "") {
    alert("Insert a valid number for hours!");
    return;
  }

  var hours = parseInt($("#endpointStatisticsHours").val());

  var unit = parseInt($("#endpointStatisticsUnit").val());
  if (unit == 2) hours *= 24;

  getEndpointHistoryByHours(currentEndpointId, hours).done(function (data) {
    if (data.length == 0) {
      alert("There is no data to be shown in the interval selected!");
    } else {
      var count = countEndpointCalls(data);

      endpointChartY = count;

      if (endpointChart != null) endpointChart.destroy();

      endpointChart = new Chart("myChart", {
        type: "pie",
        data: {
          labels: endpointChartX,
          datasets: [
            {
              backgroundColor: endpointChartBarColors,
              data: endpointChartY,
            },
          ],
        },
        options: {
          title: {
            display: true,
            text: "Statistics",
          },
        },
      });

      var ok = 0,
        notOk = 0;

      for (let i = 0; i < data.length; i++) {
        if (data[i].code == 200 || data[i].code == 302) ok++;
        else notOk++;

        if (ok > 0 && notOk > 0) break;
      }

      if (notOk == 0) {
        $("#endpointStatisticsState").css("background", "green");
        $("#endpointStatisticsState").text("Stable");
      } else if (ok == 0) {
        $("#endpointStatisticsState").css("background", "red");
        $("#endpointStatisticsState").text("Down");
      }

      $("#viewStatisticsChoice").hide();
      $("#viewStatistics").show();
    }
  });
}

async function showReportModal() {
  $("#reportPopup").show();
}

async function cancelReportModal() {
  $("#reportPopup").hide();
}

async function addReport() {
  if ($("#reportMentions").val().length < 3) {
    alert("Insert a valid comment!");
    return;
  }

  var idUser = $.cookie("UserId");
  if (idUser === undefined) idUser = null;

  insertReport({
    idApplication: currentApplicationId,
    idEndpoint: currentEndpointId,
    idUser: idUser,
    mentions: $("#reportMentions").val(),
  }).done(function () {
    patchApplication({
      idApplication: currentApplicationId,
      idState: 2,
    }).done(function () {
      $("#endpoint" + currentEndpointId)
        .children()
        .eq(1)
        .children()
        .eq(0)
        .children()
        .eq(1)
        .css("background", "rgb(152, 152, 0)");

      $("#endpoint" + currentEndpointId)
        .children()
        .eq(1)
        .children()
        .eq(0)
        .children()
        .eq(1)
        .children()
        .eq(0)
        .text("Unstable");

      $("#reportMentions").val("");
    });
  });
}

async function updateGeneralStatistics() {
  totalApplicationsLabel.text(generalStatistics.totalApplications);
  totalEndpointsGeneralLabel.text(generalStatistics.totalEndpoints);
  totalUsersLabel.text(generalStatistics.totalUsers);
  totalEndpointCallsLabel.text(generalStatistics.totalEndpointCalls);

  generalEndpoints.datasets[0].data = [
    generalStatistics.stableEndpoints,
    generalStatistics.unstableEndpoints,
    generalStatistics.downEndpoints,
  ];

  generalReports.datasets[0].data = [
    generalStatistics.solvedReports,
    generalStatistics.unsolvedReports,
  ];

  if (generalEndpointsChart != null) generalEndpointsChart.destroy();

  generalEndpointsChart = new Chart(
    document.getElementById("myChartFirst"),
    configGeneralEndpoints
  );

  if (generalReportsChart != null) generalReportsChart.destroy();

  generalReportsChart = new Chart(
    document.getElementById("myChartSecond"),
    configGeneralReports
  );
}

async function loadStatistics() {
  getGeneralStatistics().done(function (data) {
    generalStatistics.totalApplications = data[0].totalApplications;
    generalStatistics.totalEndpoints = data[0].totalEndpoints;
    generalStatistics.totalUsers = data[0].totalUsers;
    generalStatistics.totalEndpointCalls = data[0].totalEndpointHistoryRecords;

    getEndpointsStatistics().done(function (data) {
      generalStatistics.stableEndpoints = data[0].totalStableEndpoints;
      generalStatistics.unstableEndpoints = data[0].totalUnstableEndpoints;
      generalStatistics.downEndpoints = data[0].downEndpoints;

      getReportsStatistics().done(function (data) {
        generalStatistics.solvedReports = data[0].totalSolvedReports;
        generalStatistics.unsolvedReports = data[0].totalUnsolvedReports;

        updateGeneralStatistics();
      });
    });
  });
}

async function onDeleteEndpoint() {
  deleteEndpointRequest(currentEndpointId).done(function () {
    $("#myApplicationsEndpoint" + currentEndpointId).remove();
    cancelDeleteEndpointModal();
    currentEndpointId = 0;
  });
}

async function searchCards(event) {
  var text = event.target.value;
  cards.children().each(function (index, card) {
    if (
      !$(card)
        .children()
        .eq(2)
        .children()
        .eq(0)
        .text()
        .toLowerCase()
        .includes(text.toLowerCase()) &&
      !$(card)
        .children()
        .eq(2)
        .children()
        .eq(1)
        .text()
        .toLowerCase()
        .includes(text.toLowerCase())
    ) {
      if ($(card).attr("id") !== "card") {
        $(card).attr("hidden", true);
      }
    } else {
      if ($(card).attr("id") !== "card") {
        $(card).attr("hidden", false);
      }
    }
  });
}

async function searchMyApplicationsCards(event) {
  var text = event.target.value;
  myApplicationsCards.children().each(function (index, card) {
    if (
      !$(card)
        .children()
        .eq(2)
        .children()
        .eq(0)
        .text()
        .toLowerCase()
        .includes(text.toLowerCase()) &&
      !$(card)
        .children()
        .eq(2)
        .children()
        .eq(1)
        .text()
        .toLowerCase()
        .includes(text.toLowerCase())
    ) {
      if ($(card).attr("id") !== "myApplicationscard") {
        $(card).attr("hidden", true);
      }
    } else {
      if ($(card).attr("id") !== "myApplicationsCard") {
        $(card).attr("hidden", false);
      }
    }
  });
}

async function switchTabs(tab) {
  var tabToDeselect = $($(".profile")[0]);

  tabToDeselect.removeClass("profile");

  if (tabToDeselect.children().length > 2) {
    tabToDeselect.children().eq(1).css("color", "");
    tabToDeselect.children().eq(2).css("color", "#4516ac");
  } else {
    tabToDeselect.children().eq(0).css("color", "");
    tabToDeselect.children().eq(1).css("color", "#4516ac");
  }

  tab.addClass("profile");

  if (tab.children().length > 2) {
    tab.children().eq(1).css("color", "white");
    tab.children().eq(2).css("color", "white");
  } else {
    tab.children().eq(0).css("color", "white");
    tab.children().eq(1).css("color", "white");
  }
}

async function loadHomeSection() {
  try {
    //const response = await fetch("home-section.html");
    if (response.ok) {
      const content = await response.text();
      homeSection.html(content);
    } else {
      //console.error("Eroare la încărcarea conținutului.");
    }
  } catch (error) {
    //console.error("Eroare la încărcarea conținutului:", error);
  }
}

async function loadCommentsSection() {
  try {
    //const response = await fetch("comments-section.html");
    if (response.ok) {
      const content = await response.text();
      commentsSection.html(content);
    } else {
      //console.error("Eroare la încărcarea conținutului.");
    }
  } catch (error) {
    //console.error("Eroare la încărcarea conținutului:", error);
  }
}

async function loadHistorySection() {
  try {
    //const response = await fetch("history-section.html");
    if (response.ok) {
      const content = await response.text();
      historySection.html(content);
    } else {
      //console.error("Eroare la încărcarea conținutului.");
    }
  } catch (error) {
    //console.error("Eroare la încărcarea conținutului:", error);
  }
}

async function loadSettingsSection() {
  try {
    //const response = await fetch("settings-section.html");
    if (response.ok) {
      const content = await response.text();
      settingsSection.html(content);
    } else {
      //console.error("Eroare la încărcarea conținutului.");
    }
  } catch (error) {
    //console.error("Eroare la încărcarea conținutului:", error);
  }
}

async function loadMyApplications() {
  try {
    //const response = await fetch("myapps.html");
    if (response.ok) {
      const content = await response.text();
      settingsSection.html(content);
    } else {
      //console.error("Eroare la încărcarea conținutului.");
    }
  } catch (error) {
    //console.error("Eroare la încărcarea conținutului:", error);
  }
}

async function loadEndpoint() {
  try {
    //const response = await fetch("myapps.html");
    if (response.ok) {
      const content = await response.text();
      settingsSection.html(content);
    } else {
      //console.error("Eroare la încărcarea conținutului.");
    }
  } catch (error) {
    //console.error("Eroare la încărcarea conținutului:", error);
  }
}

async function closeApplicationModal() {
  $("#myModal").hide();
}

async function closeEndpointModal() {
  $("#addEndpointModal").hide();
}

async function deleteEndpointModal() {
  $("#myModal2").show();
}

async function cancelDeleteEndpointModal() {
  $("#myModal2").hide();
}

async function showHistory() {
  $("#viewHistoryPopup").show();
}

async function cancelHistory() {
  $("#viewHistoryPopup").hide();
}

function menuBtnChange() {
  if (sidebar.hasClass("open")) {
    closeBtn.removeClass("bx-menu").addClass("bx-menu-alt-right");
  } else {
    closeBtn.removeClass("bx-menu-alt-right").addClass("bx-menu");
  }
}

function tryGithubAuth() {
  var code = new URLSearchParams(window.location.search).get("code");
  if (code == null) return;

  var clientId = "39c7fb795ce563b0d1bb";
  var clientSecret = "dc5bdee410fa856f303804cd40f210b5c66ebc2f";

  $.ajax({
    type: "POST",
    url: "https://github.com/login/oauth/access_token",
    dataType: "json",
    data: {
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
    },
    success: function (data) {
      console.log(data);
    },
    error: function (error) {
      var access_token = error.responseText.substring(
        error.responseText.indexOf("=") + 1,
        error.responseText.indexOf("&")
      );

      $.ajax({
        type: "GET",
        url: "https://api.github.com/user",
        headers: {
          Authorization: "Bearer " + access_token,
        },
        success: function (data) {
          var id = data.id;

          register({
            email: "g" + id,
            password: "github",
          })
            .done(function (data) {
              $.cookie("UserId", parseInt(data), { expires: 30, path: "/" });
              window.location.href =
                "http://127.0.0.1:5500/templates/main/dashboard.html";
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              login({
                email: "g" + id,
                password: "github",
              })
                .done(function (data) {
                  $.cookie("UserId", parseInt(data), { expire: 30, path: "/" });
                  window.location.href =
                    "http://127.0.0.1:5500/templates/main/dashboard.html";
                })
                .fail(function (jqXHR, textStatus, errorThrown) {
                  console.log(errorThrown);
                });
            });
        },
        error: function (error) {
          console.log(error);
        },
      });
    },
  });
}

$(document).ready(function () {
  tryGithubAuth();

  loadNotifications();

  authArea = $("#authArea");
  logout = $("#logout");
  myApplicationsDashboard = $("#myApplications");
  notifications = $("#notifications");
  history = $("#history");
  information = $("#information");

  logout2 = $("#log_out_back2");
  myApplicationsDashboard2 = $("#apps-navbar");
  notifications2 = $("#comments-navbar");
  history2 = $("#history-navbar");
  information2 = $("#information-navbar");

  cards = $("#cards");
  myApplicationsCards = $("#myApplicationsCards");

  applicationTitle = $("#applicationTitle");
  applicationDescription = $("#applicationDescription");
  applicationImage = $("#applicationImage");
  addApplicationBtn = $("#addApplicationBtn");
  addApplicationBtn.click(function () {
    if (applicationTitle.val().length < 3) {
      alert("Type a valid application title!");
      return;
    }

    if (applicationDescription.val().length < 3) {
      alert("Type a valid application description!");
      return;
    }

    if (applicationImage.val() === "") {
      alert("Please insert an image for your application!");
      return;
    }

    var imagePath = applicationImage
      .val()
      .substring(applicationImage.val().lastIndexOf("\\") + 1);

    insertApplication({
      name: applicationTitle.val(),
      description: applicationDescription.val(),
      idUserAuthor: parseInt($.cookie("UserId")),
      image: imagePath,
    }).done(function (data) {
      var idApplication = data;
      getApplicationById(data).done(function (data) {
        addCard(parseInt($.cookie("UserId")), {
          idApplication: idApplication,
          name: data[0].name,
          description: data[0].description,
          dateCreated: data[0].dateCreated,
          applicationState: data[0].applicationState,
          image: data[0].image,
        });

        applicationTitle.val("");
        applicationDescription.val("");

        $("#addSendModal").hide();

        totalProjects++;
        updatePersonalStatistics();
      });
    });
  });

  endpointUrl = $("#endpointUrl");
  endpointType = $("#endpointType");
  endpointsWrapper = $("#endpointsWrapper");
  getEndpoint = $("#getEndpoint");
  postEndpoint = $("#postEndpoint");
  putEndpoint = $("#putEndpoint");
  patchEndpoint = $("#patchEndpoint");
  deleteEndpoint = $("#deleteEndpoint");

  personalStatsEmail = $("#personalStatsEmail");
  totalProjectsLabel = $("#totalProjectsLabel");
  totalEndpointsLabel = $("#totalEndpointsLabel");
  endpointsStableLabel = $("#endpointsStableLabel");
  endpointsUnstableLabel = $("#endpointsUnstableLabel");
  endpointsDownLabel = $("#endpointsDownLabel");

  (endpointStatisticsHours = $("#endpointStatisticsHours")),
    (endpointStatisticsUnit = $("#endpointStatisticsUnit"));

  (totalApplicationsLabel = $("#totalApplicationsLabel")),
    (totalEndpointsGeneralLabel = $("#totalEndpointsGeneralLabel"));
  (totalUsersLabel = $("#totalUsersLabel")),
    (totalEndpointCallsLabel = $("#totalEndpointCallsLabel"));

  reportMentions = $("#reportMentions");

  notification = $("#notification");
  notificationWrapper = $("#notificationWrapper");
  notificationBadge = $("#notificationBadge");

  loadStatistics();

  checkLoginStatus();
  loadCards(0);

  var userId = $.cookie("UserId");
  if (userId !== undefined) {
    loadCards(parseInt(userId));
  }

  sidebar = $(".sidebar");
  closeBtn = $("#btn");

  closeBtn.click(function () {
    sidebar.toggleClass("open");
    menuBtnChange();
  });

  logout.click(function () {
    onLogout();
  });

  homeSection = $(".home-section");
  commentsSection = $(".comments-section");
  historySection = $(".history-section");
  settingsSection = $(".settings-section");
  myApplications = $(".myapp-section");
  addPopup = $(".popup-container10");
  endpointSection = $(".editEndpoints");

  commentsSection.hide();
  historySection.hide();
  settingsSection.hide();
  myApplications.hide();
  endpointSection.hide();

  loadHomeSection();

  $("#dash").click(function () {
    switchTabs($("#dash"));

    homeSection.hide();
    commentsSection.hide();
    historySection.hide();
    settingsSection.hide();
    myApplications.hide();
    endpointSection.hide();

    loadHomeSection();
    homeSection.show();
  });

  $("#notifications").click(function () {
    switchTabs($("#notifications"));

    homeSection.hide();
    commentsSection.hide();
    historySection.hide();
    settingsSection.hide();
    myApplications.hide();
    endpointSection.hide();

    loadCommentsSection();
    commentsSection.show();
  });

  $("#history").click(function () {
    switchTabs($("#history"));

    homeSection.hide();
    commentsSection.hide();
    historySection.hide();
    settingsSection.hide();
    myApplications.hide();
    endpointSection.hide();

    loadHistorySection();
    historySection.show();
  });

  $("#settings").click(function () {
    switchTabs($("#settings"));

    homeSection.hide();
    commentsSection.hide();
    historySection.hide();
    settingsSection.hide();
    myApplications.hide();
    endpointSection.hide();

    loadSettingsSection();
    settingsSection.show();
  });

  $("#myApplications").click(function () {
    switchTabs($("#myApplications"));

    homeSection.hide();
    commentsSection.hide();
    historySection.hide();
    settingsSection.hide();
    endpointSection.hide();

    loadMyApplications();
    myApplications.show();
  });

  commentsSection.hide();
  historySection.hide();
  settingsSection.hide();
  myApplications.hide();

  $("#dash-navbar").click(function () {
    homeSection.hide();
    commentsSection.hide();
    historySection.hide();
    settingsSection.hide();
    myApplications.hide();
    endpointSection.hide();

    loadHomeSection();
    homeSection.show();
  });

  $("#comments-navbar").click(function () {
    homeSection.hide();
    commentsSection.hide();
    historySection.hide();
    settingsSection.hide();
    myApplications.hide();
    endpointSection.hide();

    loadCommentsSection();
    commentsSection.show();
  });

  $("#history-navbar").click(function () {
    homeSection.hide();
    commentsSection.hide();
    historySection.hide();
    settingsSection.hide();
    myApplications.hide();
    endpointSection.hide();

    loadHistorySection();
    historySection.show();
  });

  $("#settings-navbar").click(function () {
    homeSection.hide();
    commentsSection.hide();
    historySection.hide();
    settingsSection.hide();
    myApplications.hide();
    endpointSection.hide();

    loadSettingsSection();
    settingsSection.show();
  });

  $("#apps-navbar").click(function () {
    homeSection.hide();
    commentsSection.hide();
    historySection.hide();
    settingsSection.hide();
    endpointSection.hide();

    loadMyApplications();
    myApplications.show();
  });

  $("#information-navbar").click(function () {
    $("#viewProfile").show();
  });

  $("#addSend").click(function () {
    $("#addSendModal").show();
  });

  $("#closeButton2").click(function () {
    $("#addSendModal").hide();
  });

  $("#addEndpoint").click(function () {
    $("#addEndpointModal").show();
  });

  $("#viewStatistics").click(function () {
    $("#viewStatisticsChoice").show();
  });

  $("#information").click(function () {
    $("#viewProfile").show();
  });

  $("#closeButtonProfile").click(function () {
    $("#viewProfile").hide();
  });

  generalEndpoints = {
    labels: ["Stable", "Unstable", "Down"],
    datasets: [
      {
        label: "Endpoints",
        data: [0, 0, 0],
        backgroundColor: ["#28a745", "#ffc107", "#dc3545"], // Verde, Galben, Roșu
        borderColor: ["#28a745", "#ffc107", "#dc3545"],
        borderWidth: 1,
      },
    ],
  };

  configGeneralEndpoints = {
    type: "pie",
    data: generalEndpoints,

    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "white",
          },
        },
        title: {
          display: true,
          text: "Total Endpoints",
          color: "#ffffff",
          font: {
            size: 20,
          },
        },
      },
    },
  };

  generalReports = {
    labels: ["Solved", "Unsolved"],
    datasets: [
      {
        label: "Reports",
        data: [30, 50],
        backgroundColor: ["#28a745", "#dc3545"], // Verde, Roșu
        borderColor: ["#28a745", "#dc3545"],
        borderWidth: 1,
      },
    ],
  };

  configGeneralReports = {
    type: "doughnut",
    data: generalReports,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "white",
          },
        },
        title: {
          display: true,
          text: "Total Reports",
          color: "#ffffff",
          font: {
            size: 20,
          },
        },
      },
    },
  };

  function downloadChart() {
    var canvas = document.getElementById("myChart");
    var context = canvas.getContext("2d");

    var img = canvas.toDataURL("image/jpeg");

    var csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Label,Value\n";
    for (var i = 0; i < endpointChartX.length; i++) {
      csvContent += endpointChartX[i] + "," + endpointChartY[i] + "\n";
    }

    var csvBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    var csvURL = URL.createObjectURL(csvBlob);
    var csvLink = document.createElement("a");
    csvLink.href = csvURL;
    csvLink.download = "chart_data.csv";

    var rar = new JSZip();
    rar.file("chart.jpg", img.substr(img.indexOf(",") + 1), { base64: true });
    rar.file("chart_data.csv", csvBlob);

    rar.generateAsync({ type: "blob" }).then(function (content) {
      saveAs(content, "chart_files.rar");

      showNotification();
    });
  }

  var downloadButton = document.getElementById("downloadButton");
  downloadButton.addEventListener("click", downloadChart);

  setInterval(function () {
    loadStatistics();
  }, 15000);

  setInterval(function () {
    loadNotifications();
  }, 1000);
});

window.searchCards = searchCards;
window.addEndpoint = addEndpoint;
window.closeEndpointModal = closeEndpointModal;
window.closeApplicationModal = closeApplicationModal;
window.deleteCard = deleteCard;
window.deleteEndpointModal = deleteEndpointModal;
window.cancelDeleteEndpointModal = cancelDeleteEndpointModal;
window.onDeleteEndpoint = onDeleteEndpoint;
window.showEndpointStatistics = showEndpointStatistics;
window.cancelEndpointStatisticsModal = cancelEndpointStatisticsModal;
window.searchMyApplicationsCards = searchMyApplicationsCards;
window.showReportModal = showReportModal;
window.cancelReportModal = cancelReportModal;
window.addReport = addReport;
window.onFilterEndpoints = onFilterEndpoints;
window.showHistory = showHistory;
window.cancelHistory = cancelHistory;
