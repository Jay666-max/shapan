import { Box, Grid, Typography } from '@mui/material';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useState } from 'react';
import TradingPanel from './components/TradingPanel';
import TradeList from './components/TradeList';
import TraderStats from './components/TraderStats';
import { Trade, TradeDirection, TraderID } from './types';
import { defaultTraders, TraderConfig } from './config/traders';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1a1a1a',
      paper: '#2d2d2d',
    },
    primary: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
  },
});

function App() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [traders, setTraders] = useState<TraderConfig[]>(defaultTraders);

  const handleTrade = (trader: string, direction: TradeDirection, price: number, quantity: number) => {
    const newTrade: Trade = {
      id: Date.now().toString(),
      trader: trader as TraderID,
      direction,
      openPrice: price,
      quantity,
      remainingQuantity: quantity,
      status: 'OPEN',
      timestamp: Date.now(),
    };
    setTrades([...trades, newTrade]);
  };

  const handleCloseTrade = (tradeId: string, closePrice: number, closeQuantity: number) => {
    const originalTrade = trades.find(t => t.id === tradeId);
    if (!originalTrade) return;

    const remainingQuantity = originalTrade.remainingQuantity - closeQuantity;
    const profit = originalTrade.direction === 'LONG' 
      ? (closePrice - originalTrade.openPrice) * closeQuantity
      : (originalTrade.openPrice - closePrice) * closeQuantity;

    // 更新原始交易的剩余数量
    const updatedTrades = trades.map(trade => 
      trade.id === tradeId 
        ? { ...trade, remainingQuantity }
        : trade
    );

    // 创建新的平仓记录
    const closeTrade: Trade = {
      id: `${tradeId}-close-${Date.now()}`,
      trader: originalTrade.trader,
      direction: originalTrade.direction,
      openPrice: originalTrade.openPrice,
      closePrice,
      quantity: closeQuantity,
      remainingQuantity: 0,
      profit,
      status: 'CLOSED',
      timestamp: Date.now(),
      relatedTradeId: tradeId // 添加关联ID以便追踪
    };

    setTrades([...updatedTrades, closeTrade]);
  };

  const handleReset = () => {
    if (window.confirm('确定要清空所有交易记录吗？')) {
      setTrades([]);
    }
  };

  const handleUpdateTraderName = (traderId: string, newName: string) => {
    setTraders(traders.map(t => 
      t.id === traderId ? { ...t, name: newName } : t
    ));
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ p: 2, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Typography variant="h4" gutterBottom>51圈子-火箭班🚀沙盘PK记录系统</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TradingPanel onTrade={handleTrade} traders={traders} />
            <TraderStats trades={trades} traders={traders} onUpdateTraderName={handleUpdateTraderName} />
          </Grid>
          <Grid item xs={12} md={8}>
            <TradeList 
              trades={trades} 
              traders={traders}
              onCloseTrade={handleCloseTrade}
              onReset={handleReset}
            />
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}

export default App;