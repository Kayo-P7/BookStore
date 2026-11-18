package br.com.bookstore.sales.dto;

import java.math.BigDecimal;
import java.util.List;

// resumo consolidado de vendas para evitar transferencia integral na dashboard
public record SaleSummaryResponse(
        long totalSales,
        BigDecimal totalRevenue,
        List<SaleResponse> recentSales
) {}
