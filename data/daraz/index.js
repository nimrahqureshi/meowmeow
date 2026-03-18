/* ============================================================
   DARAZ PRODUCT INDEX
   Initialises window.DarazProducts = [] then loads all 15 category files.

   LOAD ORDER in HTML (before </body>):
     <script src="js/products/daraz/index.js"></script>
     (Each category file auto-pushes into window.DarazProducts)

   OR load individual categories only:
     <script src="js/products/daraz/Women.js"></script>
     <script src="js/products/daraz/Electronics.js"></script>
   ============================================================ */

/* Initialise array once — category files push into it */
window.DarazProducts = [];

/* Metadata used by affiliate-main.js */
window.DarazProducts._meta = {
  platform:   'Daraz',
  icon:       'fas fa-store',
  categories: ['Women', 'Men', 'Kids', 'Shoes', 'Bags', 'Jewelry', 'Watches', 'Beauty', 'Pets', 'Toys', 'Electronics', 'Crafts', 'Home', 'Accessories', 'Flowers']
};
