 function changeContent(page) {
        const content = document.getElementById("content");
        let pageContent = "";

        switch (page) {
          case "home":
            pageContent =
              "<h2>مرحبًا بك في الصفحة الرئيسية</h2><p>اختر قسمًا من القائمة لعرض المحتوى.</p>";
            break;
          case "cars":
            pageContent =
              "<h2>قسم السيارات</h2><p>هنا يمكنك إدارة السيارات.</p>";
            break;
          case "drivers":
            pageContent =
              "<h2>قسم السائقين</h2><p>هنا يمكنك إدارة السائقين.</p>";
            break;
          case "orders":
            pageContent =
              "<h2>قسم الطلبات</h2><p>هنا يمكنك عرض وإدارة الطلبات.</p>";
            break;
          case "consumables":
            pageContent =
              "<h2>قسم المستهلكات</h2><p>هنا يمكنك متابعة المستهلكات وغيرها.</p>";
            break;
          case "spareParts":
            pageContent =
              "<h2>قسم قطع الغيار</h2><p>هنا يمكنك إدارة قطع الغيار المتوفرة.</p>";
            break;
          case "reports":
            pageContent =
              "<h2>قسم التقارير</h2><p>هنا يمكنك عرض التقارير التفصيلية.</p>";
            break;
          default:
            pageContent = "<h2>مرحبًا بك</h2><p>اختر قسمًا من القائمة.</p>";
        }

        content.innerHTML = pageContent;

        const menuItems = document.querySelectorAll(".menu li");
        menuItems.forEach((item) => item.classList.remove("active"));

        event.currentTarget.classList.add("active");
      }