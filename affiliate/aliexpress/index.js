/* ============================================================
   ALIEXPRESS PRODUCT INDEX
   Initialises window.AliExpressProducts = [] then loads all 15 category files.

   LOAD ORDER in HTML (before </body>):
     <script src="js/products/aliexpress/index.js"></script>
     (Each category file auto-pushes into window.AliExpressProducts)

   OR load individual categories only:
     <script src="js/products/aliexpress/Women.js"></script>
     <script src="js/products/aliexpress/Electronics.js"></script>
   ============================================================ */

/* Initialise array once — category files push into it */
window.AliExpressProducts = [];

/* Metadata used by affiliate-main.js */
window.AliExpressProducts._meta = {
  platform:   'AliExpress',
  icon:       'fas fa-globe',
  categories: ['Women', 'Men', 'Kids', 'Shoes', 'Bags', 'Jewelry', 'Watches', 'Beauty', 'Pets', 'Toys', 'Electronics', 'Crafts', 'Home', 'Accessories', 'Flowers']
};
