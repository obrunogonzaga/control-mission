package sse

import (
	"encoding/json"
	"fmt"
	"sync"
)

// Broker multiplexes server-sent events across all connected clients.
type Broker struct {
	mu      sync.RWMutex
	clients map[chan string]struct{}
}

func NewBroker() *Broker {
	return &Broker{clients: make(map[chan string]struct{})}
}

func (b *Broker) Register() chan string {
	ch := make(chan string, 32)
	b.mu.Lock()
	b.clients[ch] = struct{}{}
	b.mu.Unlock()
	return ch
}

func (b *Broker) Unregister(ch chan string) {
	b.mu.Lock()
	if _, exists := b.clients[ch]; !exists {
		b.mu.Unlock()
		return
	}
	delete(b.clients, ch)
	b.mu.Unlock()
	close(ch)
}

func (b *Broker) Broadcast(event string, rawJSON string) {
	msg := fmt.Sprintf("event: %s\ndata: %s\n\n", event, rawJSON)
	b.mu.RLock()
	defer b.mu.RUnlock()

	for client := range b.clients {
		select {
		case client <- msg:
		default:
		}
	}
}

func (b *Broker) BroadcastJSON(event string, payload any) error {
	bytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("sse: marshal payload: %w", err)
	}
	b.Broadcast(event, string(bytes))
	return nil
}
