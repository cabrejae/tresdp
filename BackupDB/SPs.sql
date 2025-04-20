DELIMITER $$
CREATE DEFINER=`httpswwwtresdpcomar`@`localhost` PROCEDURE `GuardarPedido`(IN `p_product_id` INT, IN `p_variation_id` INT, IN `p_order_number` VARCHAR(100), IN `p_quantity` INT)
BEGIN
    INSERT INTO tresdp_pending_orders (
        product_id,
        variation_id,
        order_number,
        quantity,
        order_date
    )
    VALUES (
        p_product_id,
        p_variation_id,
        p_order_number,
        p_quantity,
        CURDATE()
    );
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`httpswwwtresdpcomar`@`localhost` PROCEDURE `SP_EliminarPedido`(IN `in_Order_number` VARCHAR(255) CHARSET latin1)
BEGIN
    DELETE FROM tresdp_pending_orders WHERE order_number = in_Order_number;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`httpswwwtresdpcomar`@`localhost` PROCEDURE `SP_ObtenerPedidosPendientes`()
BEGIN
    SELECT 
        po.id,
        po.product_id,
        po.variation_id,
        COALESCE(v.post_title, p.post_title) AS post_title,
        po.order_number,
        po.quantity,
        po.order_date
    FROM tresdp_pending_orders po
    LEFT JOIN wpot_posts p ON po.product_id = p.ID
    LEFT JOIN wpot_posts v ON po.variation_id = v.ID;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`httpswwwtresdpcomar`@`localhost` PROCEDURE `SP_ObtenerProductosBajoStock`()
BEGIN

-- Productos simples (sin variaciones)
SELECT 
    p.ID AS product_id,
    NULL AS variation_id,
    p.post_title,
    CAST(COALESCE(s.meta_value, '0') AS SIGNED) AS stock,
    CAST(COALESCE(ls.meta_value, '0') AS SIGNED) AS low_stock_threshold,
    COALESCE(po.pending_quantity, 0) AS pending_quantity
FROM wpot_posts p
LEFT JOIN wpot_postmeta s 
    ON p.ID = s.post_id AND s.meta_key = '_stock'
LEFT JOIN wpot_postmeta ls 
    ON p.ID = ls.post_id AND ls.meta_key = '_low_stock_amount'
LEFT JOIN (
    SELECT 
        product_id, 
        SUM(quantity) AS pending_quantity
    FROM tresdp_pending_orders
    WHERE variation_id IS NULL
    GROUP BY product_id
) po ON po.product_id = p.ID
WHERE p.post_type = 'product'
    AND NOT EXISTS (
        SELECT 1 
        FROM wpot_posts v 
        WHERE v.post_parent = p.ID 
        AND v.post_type = 'product_variation'
    )
HAVING (stock + pending_quantity) < low_stock_threshold

UNION ALL

-- Variaciones de productos
SELECT 
    p.ID AS product_id,
    v.ID AS variation_id,
    v.post_title,
    CAST(COALESCE(vs.meta_value, '0') AS SIGNED) AS stock,
    CAST(COALESCE(vls.meta_value, '0') AS SIGNED) AS low_stock_threshold,
    COALESCE(po.pending_quantity, 0) AS pending_quantity
FROM wpot_posts p
INNER JOIN wpot_posts v 
    ON v.post_parent = p.ID AND v.post_type = 'product_variation'
LEFT JOIN wpot_postmeta vs 
    ON v.ID = vs.post_id AND vs.meta_key = '_stock'
LEFT JOIN wpot_postmeta vls 
    ON v.ID = vls.post_id AND vls.meta_key = '_low_stock_amount'
LEFT JOIN (
    SELECT 
        variation_id, 
        SUM(quantity) AS pending_quantity
    FROM tresdp_pending_orders
    WHERE variation_id IS NOT NULL
    GROUP BY variation_id
) po ON po.variation_id = v.ID
WHERE p.post_type = 'product'
HAVING (stock + pending_quantity) < low_stock_threshold;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`httpswwwtresdpcomar`@`localhost` PROCEDURE `SP_ObtenerTodosLosProductos`()
BEGIN

  SELECT * FROM (
    -- Productos simples (sin variaciones)
    SELECT 
        p.ID AS product_id,
        NULL AS variation_id,
        p.post_title,
        CAST(COALESCE(s.meta_value, '0') AS SIGNED) AS stock,
        CAST(COALESCE(ls.meta_value, '0') AS SIGNED) AS low_stock_threshold,
        COALESCE(po.pending_quantity, 0) AS pending_quantity
    FROM wpot_posts p
    LEFT JOIN wpot_postmeta s 
        ON p.ID = s.post_id AND s.meta_key = '_stock'
    LEFT JOIN wpot_postmeta ls 
        ON p.ID = ls.post_id AND ls.meta_key = '_low_stock_amount'
    LEFT JOIN (
        SELECT 
            product_id, 
            SUM(quantity) AS pending_quantity
        FROM tresdp_pending_orders
        WHERE variation_id IS NULL
        GROUP BY product_id
    ) po ON po.product_id = p.ID
    WHERE p.post_type = 'product'
        AND NOT EXISTS (
            SELECT 1 
            FROM wpot_posts v 
            WHERE v.post_parent = p.ID 
            AND v.post_type = 'product_variation'
        )

    UNION ALL

    -- Variaciones de productos
    SELECT 
        p.ID AS product_id,
        v.ID AS variation_id,
        v.post_title,
        CAST(COALESCE(vs.meta_value, '0') AS SIGNED) AS stock,
        CAST(COALESCE(vls.meta_value, '0') AS SIGNED) AS low_stock_threshold,
        COALESCE(po.pending_quantity, 0) AS pending_quantity
    FROM wpot_posts p
    INNER JOIN wpot_posts v 
        ON v.post_parent = p.ID AND v.post_type = 'product_variation'
    LEFT JOIN wpot_postmeta vs 
        ON v.ID = vs.post_id AND vs.meta_key = '_stock'
    LEFT JOIN wpot_postmeta vls 
        ON v.ID = vls.post_id AND vls.meta_key = '_low_stock_amount'
    LEFT JOIN (
        SELECT 
            variation_id, 
            SUM(quantity) AS pending_quantity
        FROM tresdp_pending_orders
        WHERE variation_id IS NOT NULL
        GROUP BY variation_id
    ) po ON po.variation_id = v.ID
    WHERE p.post_type = 'product'
  ) AS todos_productos
  ORDER BY post_title;

END$$
DELIMITER ;
